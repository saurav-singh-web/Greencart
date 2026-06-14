import express from "express";
import authSeller from "../../middlewares/authSeller.js";
import authUser from "../../middlewares/authUser.js";
import { createCoupon, deleteCoupon, getCoupons, validateCoupon } from "../../controllers/seller/couponController.js";

const couponRouter = express.Router();

// Seller Routes
couponRouter.post("/create", authSeller, createCoupon);
couponRouter.get("/list", authSeller, getCoupons);
couponRouter.post("/delete", authSeller, deleteCoupon);

// User Routes
couponRouter.post("/validate", authUser, validateCoupon);

export default couponRouter;
