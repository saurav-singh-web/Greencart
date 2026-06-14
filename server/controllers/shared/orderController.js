//Place order : /api/address/cod

import Order from "../../models/Order.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Coupon from "../../models/Coupon.js";
import stripe from "stripe";

// Helper: group cart items by their sellerId
const groupItemsBySeller = async (items) => {
  const groups = {};
  for (const item of items) {
    const productDoc = await Product.findById(item.product);
    if (!productDoc) continue;
    const key = productDoc.sellerId || "unassigned";
    if (!groups[key]) groups[key] = { sellerId: key, items: [], subtotal: 0 };
    groups[key].items.push(item);
    groups[key].subtotal += productDoc.offerPrice * item.quantity;
  }
  return Object.values(groups);
};

export const placeOrderCod = async (req, res) => {
  try {
    const { userId, address, items, couponCode } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // Group items by seller
    const sellerGroups = await groupItemsBySeller(items);

    // Calculate coupon discount ratio (apply proportionally across all sellers)
    let totalSubtotal = sellerGroups.reduce((acc, g) => acc + g.subtotal, 0);
    let discountRatio = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= new Date(coupon.expiryDate) && totalSubtotal >= coupon.minPurchaseAmount) {
        const discountAmount = coupon.discountType === 'percentage'
          ? (totalSubtotal * coupon.discountValue) / 100
          : coupon.discountValue;
        discountRatio = Math.min(discountAmount, totalSubtotal) / totalSubtotal;
      }
    }

    // Create one order per seller
    for (const group of sellerGroups) {
      const discountedSubtotal = group.subtotal * (1 - discountRatio);
      const amount = Math.floor(discountedSubtotal * 1.02 * 100) / 100;
      await Order.create({
        userId,
        sellerId: group.sellerId,
        items: group.items,
        amount,
        address,
        paymentType: "COD",
      });
    }

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Place order Stripe :  /api/address/Stripe

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, address, items, couponCode } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // Group items by seller
    const sellerGroups = await groupItemsBySeller(items);
    let totalSubtotal = sellerGroups.reduce((acc, g) => acc + g.subtotal, 0);

    // Apply Coupon
    let discountRatio = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= new Date(coupon.expiryDate) && totalSubtotal >= coupon.minPurchaseAmount) {
        const discountAmount = coupon.discountType === 'percentage'
          ? (totalSubtotal * coupon.discountValue) / 100
          : coupon.discountValue;
        discountRatio = Math.min(discountAmount, totalSubtotal) / totalSubtotal;
      }
    }

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = [];
    const orderIds = [];

    // Create one order per seller, build line items for Stripe
    for (const group of sellerGroups) {
      const discountedSubtotal = group.subtotal * (1 - discountRatio);
      const amount = Math.floor(discountedSubtotal * 1.02 * 100) / 100;

      const order = await Order.create({
        userId,
        sellerId: group.sellerId,
        items: group.items,
        amount,
        address,
        paymentType: "Online",
      });
      orderIds.push(order._id.toString());

      // Build stripe line items for this seller group
      for (const item of group.items) {
        const productDoc = await Product.findById(item.product);
        const discountedPrice = productDoc.offerPrice * (1 - discountRatio);
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: { name: productDoc.name },
            unit_amount: Math.floor(discountedPrice * 1.02 * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    // Create a single Stripe session for all line items
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata: {
        orderIds: orderIds.join(","),
        userId,
      },
    });

    return res.json({
      success: true,
      url: session.url,
      orderId: orderIds[0], // keep compat – return first order ID
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
      const metadata = session.data[0].metadata;
      const userId = metadata.userId;
      // Support both new multi-seller orderIds and legacy single orderId
      const orderIds = metadata.orderIds
        ? metadata.orderIds.split(",")
        : [metadata.orderId];

      // Mark all split orders as paid
      await Promise.all(orderIds.map(id => Order.findByIdAndUpdate(id, { isPaid: true })));
      // Clear user cart
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
      const metadata = session.data[0].metadata;
      const orderIds = metadata.orderIds
        ? metadata.orderIds.split(",")
        : [metadata.orderId];

      // Mark all split orders as failed
      await Promise.all(orderIds.map(id =>
        Order.findByIdAndUpdate(id, { status: "Payment Failed", isPaid: false })
      ));
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
    const userId = req.query.userId || req.userId;
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
    const sellerId = req.sellerId; // set by authSeller middleware
    const query = {
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    };
    // Regular sellers only see their own orders
    if (sellerId) {
      query.sellerId = sellerId;
    }
    const orders = await Order.find(query)
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe Payment : /api/order/verify-stripe
export const verifyStripePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const order = await Order.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    // Already marked paid by webhook
    if (order.isPaid) {
      return res.json({ success: true, message: "Payment already verified" });
    }

    // Actively check Stripe for the session linked to this order
    const sessions = await stripeInstance.checkout.sessions.list({ limit: 20 });
    const session = sessions.data.find(
      (s) => s.metadata && s.metadata.orderId === orderId
    );

    if (session && session.payment_status === "paid") {
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await User.findByIdAndUpdate(order.userId, { cartItems: {} });
      return res.json({ success: true, message: "Payment verified successfully" });
    }

    return res.json({ success: false, message: "Payment not confirmed yet" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Order Status : /api/order/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const sellerId = req.sellerId;

    // Ownership check for regular sellers
    if (sellerId) {
      const order = await Order.findById(orderId);
      if (!order) return res.json({ success: false, message: "Order not found" });
      if (order.sellerId && order.sellerId !== sellerId) {
        return res.json({ success: false, message: "Unauthorized: Not your order" });
      }
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
