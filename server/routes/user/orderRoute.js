import express from "express";
import authUser from "../../middlewares/authUser.js";
import {
  getAllOrder,
  getUserOrder,
  placeOrderCod,
  placeOrderStripe,
  verifyStripePayment,
  updateOrderStatus
} from "../../controllers/shared/orderController.js";
import authSeller from "../../middlewares/authSeller.js";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, placeOrderCod);
orderRouter.get("/user", authUser, getUserOrder);
orderRouter.get("/seller", authSeller, getAllOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/verify-stripe", authUser, verifyStripePayment);
orderRouter.post("/status", authSeller, updateOrderStatus);

export default orderRouter;
