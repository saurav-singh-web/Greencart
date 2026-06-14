import express from "express";
import {
  isSellerAuth,
  sellerLogin,
  sellerLogout,
  sellerRegister,
} from "../../controllers/seller/sellerController.js";
import authSeller from "../../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/register", sellerRegister);
sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);
sellerRouter.get("/logout", sellerLogout);

export default sellerRouter;
