import User from "../../models/User.js";
import Product from "../../models/Product.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true, // Prevent javascript to access cookie
      secure: process.env.NODE_ENV === "production", // use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF production
      maxAge: 7 * 24 * 60 * 1000, // Cookiw expiration time
    });

    return res.json({
      success: true,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// login User : /api/user/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({
        success: false,
        message: "Email and password are required",
      });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({
        success: false,
        message: "  Invalid email or password",
      });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: { _id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// check auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User : /api/user/Logout
export const Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Add product review : /api/user/review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    if (!productId || !rating || !comment) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(userId);

    const review = {
      userId,
      userName: user.name,
      rating: Number(rating),
      comment,
      date: new Date()
    };

    // Check if user already reviewed
    const existingReviewIndex = product.reviews.findIndex(r => r.userId.toString() === userId);

    if (existingReviewIndex !== -1) {
      // Update existing review
      product.reviews[existingReviewIndex] = review;
    } else {
      // Add new review
      product.reviews.push(review);
    }

    // Recalculate average rating
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    // Force Mongoose to track the array changes
    product.markModified('reviews');
    await product.save();
    return res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
