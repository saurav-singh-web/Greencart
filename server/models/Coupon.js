import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    sellerId: { type: String, required: false, ref: "seller" },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minPurchaseAmount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Coupon = mongoose.models.coupon || mongoose.model('coupon', couponSchema);
export default Coupon;
