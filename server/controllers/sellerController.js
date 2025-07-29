import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";

// Register Seller : api/seller/register
export const sellerRegister = async (req, res) => {
  try {
    const { name, email, password, businessName, phone, address } = req.body;

    if (!name || !email || !password || !businessName || !phone || !address) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller)
      return res.json({ success: false, message: "Seller already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({ 
      name, 
      email, 
      password: hashedPassword,
      businessName,
      phone,
      address
    });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ 
      success: true, 
      seller: { 
        email: seller.email, 
        name: seller.name,
        businessName: seller.businessName
      } 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Login Seller : api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's the admin seller from env variables
    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true, message: "Admin Logged In" });
    }

    // Regular seller login
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ 
      success: true, 
      seller: { 
        email: seller.email, 
        name: seller.name,
        businessName: seller.businessName
      } 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// SEller Auth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    // If it's the admin seller
    if (req.isAdmin) {
      return res.json({ success: true, isAdmin: true });
    }
    
    // Regular seller
    const seller = await Seller.findById(req.sellerId).select("-password");
    if (!seller) {
      return res.json({ success: false, message: "Seller not found" });
    }
    
    return res.json({ 
      success: true, 
      seller: {
        email: seller.email,
        name: seller.name,
        businessName: seller.businessName
      }
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
