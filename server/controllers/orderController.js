//Place order : /api/address/cod

import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import stripe from "stripe";


export const placeOrderCod = async (req, res) => {
  try {
    const { userId, address, items } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }
    //Calculate Amount Using Item
    let amount = await items.reduce(async (accPromise, item) => {
      const accVal = await accPromise;
      const productDoc = await Product.findById(item.product);
      return accVal + productDoc.offerPrice * item.quantity;
    }, Promise.resolve(0));

    //Add Tax charge (2%)\

    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Place order Stripe :  /api/address/Stripe

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, address, items } = req.body;

    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];

    //Calculate Amount Using Item
    let amount = await items.reduce(async (accPromise, item) => {
      const accVal = await accPromise;
      const productDoc = await Product.findById(item.product);
      productData.push({
        name: productDoc.name,
        price: productDoc.offerPrice,
        quantity: item.quantity,
      });
      return accVal + productDoc.offerPrice * item.quantity;
    }, Promise.resolve(0));

    //Add Tax charge (2%)\

    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    //stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //create line item for stripe

    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    //create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ 
      success: true, 
      url: session.url,
      orderId: order._id.toString() // Return the order ID
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//stripe webhooks to verify payment action : /stripe

export const stripeWebhooks = async (request, response) => {
  //stripe gateway initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  //Handle the event

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId, userId } = session.data[0].metadata;
      //Mark Payment as paid

      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      //clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId } = session.data[0].metadata;
      
      // Mark the order as failed instead of deleting it
      await Order.findByIdAndUpdate(orderId, { 
        status: "Payment Failed",
        isPaid: false
      });
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};
// Get Orders by User ID : /api/order/user
export const getUserOrder = async (req, res) => {
  try {
    const userId = req.query.userId || req.userid;
    console.log("Fetching orders for userId:", userId);

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .sort({ createdAt: -1 });
    console.log("Orders found:", orders.length);

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders (for seller/admin) : /api/order/seller
export const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
