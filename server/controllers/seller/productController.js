import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import Product from "../../models/Product.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

//Add Product: /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        fs.unlinkSync(item.path);
        return result.secure_url;
      })
    );

    // Attach sellerId from the authenticated seller (or admin)
    const sellerId = req.sellerId || null;
    await Product.create({ ...productData, image: imagesUrl, sellerId });

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get Product: /api/product/list  — public, returns all products for shop browsing
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get Seller Products: /api/product/seller-list — only products belonging to the authenticated seller
export const sellerProductList = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    // Admin sees everything; regular sellers see only their own
    const query = sellerId ? { sellerId } : {};
    const products = await Product.find(query);
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get single Product: /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//change Product inStock: /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const sellerId = req.sellerId;

    // Verify ownership: find product and check sellerId
    if (sellerId) {
      const product = await Product.findById(id);
      if (!product) return res.json({ success: false, message: "Product not found" });
      if (product.sellerId && product.sellerId !== sellerId) {
        return res.json({ success: false, message: "Unauthorized: Not your product" });
      }
    }

    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// AI Copilot for Seller Add Product: /api/product/ai-copilot
export const aiCopilotFill = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const apiKeys = Object.keys(process.env)
      .filter(k => k.startsWith('GEMINI_API_KEY'))
      .map(k => process.env[k])
      .filter(val => val);
      
    if (apiKeys.length === 0) {
      return res.status(500).json({ success: false, message: "No API key configured" });
    }

    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Read image as base64
    const imageBytes = fs.readFileSync(file.path);
    const base64Image = imageBytes.toString("base64");

    const prompt = `You are an expert e-commerce copywriter for an organic grocery and daily essentials marketplace called GreenCart.
Look closely at this product image.
Generate a JSON object with the following fields:
- "name": A catchy, SEO-friendly product title (e.g. "Farm Fresh Organic Heirloom Tomatoes").
- "description": A rich, engaging description highlighting freshness, quality, and potential uses (2-3 sentences).
- "category": Choose exactly one of the following that best fits: ["Vegetables", "Fruits", "Dairy", "Bakery", "Meat", "Beverages", "Snacks", "Pantry", "Household", "Personal Care", "Others"].
- "price": A realistic retail price for this item in USD (as a number, e.g. 4.99).

Return ONLY the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json.`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.mimetype
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

    let productData;
    try {
      productData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", responseText);
      return res.status(500).json({ success: false, message: "AI returned invalid format." });
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({ success: true, data: productData });

  } catch (error) {
    console.error("AI Copilot Error:", error);
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch(e){} }
    res.status(500).json({ success: false, message: error.message });
  }
};