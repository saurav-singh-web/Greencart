import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: String, required: false, ref: "seller" },
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    reviews: [
      {
        userId: { type: String, ref: "user", required: true },
        userName: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
      }
    ],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const product =
  mongoose.models.product || mongoose.model("product", productSchema);

export default product;
