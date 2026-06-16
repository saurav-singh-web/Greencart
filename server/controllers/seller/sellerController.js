import jwt from "jsonwebtoken";
import Seller from "../../models/Seller.js";
import bcrypt from "bcryptjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// AI Review Analysis : /api/seller/review-analysis
export const generateReviewAnalysis = async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.json({ success: false, message: "No reviews provided for analysis." });
    }

    const apiKeys = Object.keys(process.env)
      .filter(k => k.startsWith('GEMINI_API_KEY'))
      .map(k => process.env[k])
      .filter(val => val);
      
    if (apiKeys.length === 0) {
      return res.status(500).json({ success: false, message: "No API key configured for AI" });
    }

    const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Format reviews for the prompt
    const reviewsText = reviews.map(r => `Product: ${r.product?.name || 'Unknown'}, Rating: ${r.rating}/5, Comment: "${r.comment}"`).join('\n');

    const prompt = `You are an expert e-commerce business analyst for an organic grocery and daily essentials marketplace called GreenCart.
Please analyze the following customer reviews left for a specific seller. 

Reviews:
${reviewsText}

Based on these reviews, generate a JSON object with the following fields:
- "overallSentiment": A short string representing the general mood (e.g., "Highly Positive", "Mostly Positive", "Mixed", "Needs Improvement").
- "whatCustomersLove": An array of 2 to 4 strings highlighting the most praised aspects.
- "areasForImprovement": An array of 1 to 3 strings highlighting constructive feedback or common complaints.

Return ONLY the raw JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

    try {
      const analysisData = JSON.parse(responseText);
      return res.json({ success: true, analysis: analysisData });
    } catch (parseError) {
      console.log("Failed to parse AI output:", responseText);
      return res.json({ success: false, message: "Failed to generate a readable analysis from the AI." });
    }

  } catch (error) {
    console.log(error.message);
    let friendlyMessage = "Something went wrong while generating the AI analysis. Please try again later.";
    if (error.message.includes("429") || error.message.includes("Quota") || error.message.includes("exceeded")) {
      friendlyMessage = "AI Server is currently busy (Too many requests). Please wait a few seconds and try again.";
    }
    res.json({ success: false, message: friendlyMessage });
  }
};
