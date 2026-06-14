import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import Product from "../models/Product.js";

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