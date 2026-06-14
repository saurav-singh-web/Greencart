import { GoogleGenerativeAI } from "@google/generative-ai";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Coupon from "../../models/Coupon.js";
import User from "../../models/User.js";

let currentKeyIndex = 0;

export const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.userId; // authUser middleware attaches it to req.userId

    // Extract all API keys
    const apiKeys = Object.keys(process.env)
      .filter(k => k.startsWith('GEMINI_API_KEY'))
      .sort()
      .map(k => process.env[k])
      .filter(val => val);

    if (apiKeys.length === 0) {
      return res.status(500).json({ success: false, message: "No GEMINI_API_KEY configured." });
    }

    // Fetch user context (recent orders and current cart)
    let userContext = "The user has no recent orders.";
    let cartContext = "The user currently has nothing in their cart.";
    if (userId) {
      // Fetch orders
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      if (orders && orders.length > 0) {
        const productIds = [];
        orders.forEach(o => {
          o.items.forEach(item => {
            if (item.product && !productIds.includes(item.product.toString())) {
              productIds.push(item.product.toString());
            }
          });
        });

        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        userContext = orders.map((o, i) => {
          const itemsStr = o.items.map(item => {
             const prod = productMap[item.product.toString()];
             return `${item.quantity}x ${prod ? prod.name : 'Unknown Product'}`;
          }).join(", ");
          return `Order ${i + 1}: ID ${o._id}, Status: ${o.status}, Amount: $${o.amount}, Items: ${itemsStr}, Placed on: ${new Date(o.createdAt).toLocaleDateString()}`;
        }).join("\n");
      }

      // Fetch cart
      const user = await User.findById(userId);
      if (user && user.cartItems && Object.keys(user.cartItems).length > 0) {
        const cartProductIds = Object.keys(user.cartItems);
        const cartProducts = await Product.find({ _id: { $in: cartProductIds } });
        const cartProductMap = {};
        cartProducts.forEach(p => { cartProductMap[p._id.toString()] = p; });

        const cartItemsArr = [];
        for (const [prodId, qty] of Object.entries(user.cartItems)) {
          if (qty > 0) {
            const prod = cartProductMap[prodId];
            cartItemsArr.push(`${qty}x ${prod ? prod.name : 'Unknown Product'} (ID: ${prodId})`);
          }
        }
        
        if (cartItemsArr.length > 0) {
          cartContext = "Current Cart Contents:\n" + cartItemsArr.join("\n");
        }
      }
    }

    const systemPrompt = `You are a professional, concise, and helpful AI customer support assistant for GreenCart, an online multivendor marketplace.
    
Here is the user's recent order history to provide context:
${userContext}

Here is the user's current shopping cart:
${cartContext}

Rules:
- Be polite and professional.
- Keep your answers concise and directly address the user's question.
- Do not make up order information. If the user asks about an order not in the context, tell them you don't have information about it.
- IMPORTANT: Users might refer to their order by the last few characters of the ID (e.g. "order #3953a1c5" instead of "6a2e11b8f0f88e873953a1c5"). Always check if the user's provided ID matches the end of any of the order IDs in the context.
- Format responses nicely (e.g., using bullet points if helpful).
- You can search for products, add items to the user's cart, and redirect their screen. Use your tools when appropriate.
- CRITICAL: After you call a tool (like search_products), you MUST output a text message to the user summarizing the results or confirming the action. Never return an empty response after a tool call. If you search for products, list the products and their prices to the user.
- STRICT DOMAIN BOUNDARY: You are exclusively a customer support agent for GreenCart. You MUST absolutely refuse to answer any questions that are not related to GreenCart, groceries, shopping, the user's account, or orders. If the user asks about coding (e.g. javascript), math, history, general knowledge, or any off-topic subject, politely decline and steer the conversation back to GreenCart.`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: "search_products",
            description: "Search for available products in the store by name or keyword.",
            parameters: {
              type: "OBJECT",
              properties: {
                query: { type: "STRING", description: "The search query, e.g. 'apple', 'shirt'" }
              },
              required: ["query"]
            }
          },
          {
            name: "add_to_cart",
            description: "Adds a specific product to the user's shopping cart.",
            parameters: {
              type: "OBJECT",
              properties: {
                productId: { type: "STRING", description: "The database ID of the product to add" },
                quantity: { type: "NUMBER", description: "The quantity to add (default 1)" }
              },
              required: ["productId"]
            }
          },
          {
            name: "redirect_user",
            description: "Redirects the user's screen to a specific page on the website.",
            parameters: {
              type: "OBJECT",
              properties: {
                path: { type: "STRING", description: "The URL path to navigate to, e.g. '/cart', '/my-orders', '/', '/products'" }
              },
              required: ["path"]
            }
          },
          {
            name: "apply_coupon",
            description: "Validates and applies a coupon code to the user's cart.",
            parameters: {
              type: "OBJECT",
              properties: {
                code: { type: "STRING", description: "The coupon code string, e.g. 'SAVE20'" }
              },
              required: ["code"]
            }
          },
          {
            name: "update_cart_quantity",
            description: "Updates the exact quantity of a product already in the cart, or removes it if quantity is 0.",
            parameters: {
              type: "OBJECT",
              properties: {
                productId: { type: "STRING", description: "The database ID of the product" },
                quantity: { type: "NUMBER", description: "The new exact quantity for this item. Use 0 to completely remove it." }
              },
              required: ["productId", "quantity"]
            }
          },
          {
            name: "remove_coupon",
            description: "Removes the currently applied coupon code from the user's cart.",
            parameters: {
              type: "OBJECT",
              properties: {}
            }
          }
        ]
      }
    ];

    // Construct the full prompt context for this message
    // In a production app with gemini you'd use startChat, but for a simple stateless-ish approach we can pass history in the prompt.
    // However, Gemini API supports `history` array for chat sessions. Let's use it.
    
    const formattedHistory = history ? history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts }]
    })) : [];

    let result;
    const actions = [];
    let lastSearchResults = null;
    let attempts = 0;
    const maxAttempts = apiKeys.length;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          systemInstruction: systemPrompt,
          tools: tools
        });

        const chat = model.startChat({
          history: formattedHistory
        });

        result = await chat.sendMessage(message);

        // Extract function calls robustly
        let getFunctionCalls = (resp) => {
          if (resp.functionCalls && typeof resp.functionCalls === 'function') return resp.functionCalls();
          if (resp.functionCalls && Array.isArray(resp.functionCalls)) return resp.functionCalls;
          const parts = resp.candidates?.[0]?.content?.parts || [];
          return parts.filter(p => p.functionCall).map(p => p.functionCall);
        };

        let calls = getFunctionCalls(result.response);

        // Process function calls if any
        while (calls && calls.length > 0) {
          const functionResponsesParts = [];

          for (const call of calls) {
            const functionName = call.name;
            const args = call.args;
            
            let functionResponseData = {};

            if (functionName === "search_products") {
              const query = args.query || "";
              const searchResults = await Product.find({ name: { $regex: query, $options: "i" } }).limit(5);
              const mappedResults = searchResults.map(p => ({ id: p._id, name: p.name, price: p.price, inStock: p.inStock }));
              functionResponseData = { results: mappedResults };
              
              if (!lastSearchResults) lastSearchResults = [];
              lastSearchResults = [...lastSearchResults, ...mappedResults];
            } else if (functionName === "add_to_cart") {
              actions.push({ type: "ADD_TO_CART", productId: args.productId, quantity: args.quantity || 1 });
              functionResponseData = { success: true, message: "Added to cart on the user's frontend." };
            } else if (functionName === "redirect_user") {
              actions.push({ type: "REDIRECT", path: args.path });
              functionResponseData = { success: true, message: "Redirected user successfully." };
            } else if (functionName === "apply_coupon") {
              const code = (args.code || "").toUpperCase();
              const coupon = await Coupon.findOne({ code, isActive: true });
              if (!coupon) {
                functionResponseData = { success: false, message: "Coupon is invalid or inactive." };
              } else if (new Date() > new Date(coupon.expiryDate)) {
                functionResponseData = { success: false, message: "Coupon has expired." };
              } else {
                actions.push({ type: "APPLY_COUPON", coupon });
                functionResponseData = { success: true, message: "Coupon applied successfully. Tell the user what the discount is." };
              }
            } else if (functionName === "update_cart_quantity") {
              actions.push({ type: "UPDATE_CART_QUANTITY", productId: args.productId, quantity: args.quantity });
              functionResponseData = { success: true, message: "Cart quantity updated on the user's frontend." };
            } else if (functionName === "remove_coupon") {
              actions.push({ type: "REMOVE_COUPON" });
              functionResponseData = { success: true, message: "Coupon removed from the user's frontend." };
            }
            
            functionResponsesParts.push({
              functionResponse: {
                name: functionName,
                response: functionResponseData,
                id: call.id // Pass back the ID for parallel function calling
              }
            });
          }
          
          // Send all responses back at once
          result = await chat.sendMessage(functionResponsesParts);
          calls = getFunctionCalls(result.response);
        }
        
        lastError = null;
        break; // Success! Break out of retry loop
      } catch (error) {
        lastError = error;
        const errorMsg = error.message || "";
        if (errorMsg.includes("429") || errorMsg.includes("Quota") || errorMsg.includes("503") || errorMsg.includes("unavailable")) {
          currentKeyIndex++;
          attempts++;
          console.log(`Key rate limited or unavailable. Switching to key index ${currentKeyIndex % apiKeys.length}`);
          continue; // Retry with next key
        } else {
          throw error; // Other error, don't retry
        }
      }
    }

    if (lastError) {
      throw lastError; // All keys exhausted or fatal error
    }

    let responseText = "";
    try {
      console.log("FINAL GEMINI RESPONSE:", JSON.stringify(result.response, null, 2));
      responseText = result.response.text();
    } catch (e) {
      console.log("NO TEXT PART FOUND IN RESPONSE.");
      // No text part available
    }

    if (!responseText || responseText.trim() === "") {
      if (actions.length > 0) {
        responseText = "I have completed that action for you.";
      } else if (lastSearchResults && lastSearchResults.length > 0) {
        responseText = "Here is what I found:\n" + lastSearchResults.map(p => `- **${p.name}**: $${p.price} ${p.inStock ? '(In Stock)' : '(Out of Stock)'}`).join("\n");
      } else if (lastSearchResults && lastSearchResults.length === 0) {
        responseText = "I searched the store but couldn't find any products matching that.";
      } else {
        responseText = "I couldn't generate a response, but I have processed your request.";
      }
    }

    res.json({ success: true, response: responseText, actions });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
