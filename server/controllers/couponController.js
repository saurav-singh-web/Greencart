import Coupon from "../models/Coupon.js";

// Create Coupon : /api/coupon/create (Seller)
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minPurchaseAmount, expiryDate } = req.body;
        const sellerId = req.sellerId || null;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const coupon = await Coupon.create({
            sellerId,
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchaseAmount: minPurchaseAmount || 0,
            expiryDate
        });

        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get Seller Coupons : /api/coupon/list (Seller)
export const getCoupons = async (req, res) => {
    try {
        const sellerId = req.sellerId;
        // Each seller only sees their own coupons
        const query = sellerId ? { sellerId } : {};
        const coupons = await Coupon.find(query).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete Coupon : /api/coupon/delete (Seller)
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.body;
        const sellerId = req.sellerId;

        // Ownership check
        if (sellerId) {
            const coupon = await Coupon.findById(id);
            if (!coupon) return res.json({ success: false, message: "Coupon not found" });
            if (coupon.sellerId && coupon.sellerId !== sellerId) {
                return res.json({ success: false, message: "Unauthorized: Not your coupon" });
            }
        }

        await Coupon.findByIdAndDelete(id);
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Validate Coupon : /api/coupon/validate (User)
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid or inactive coupon code" });
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return res.json({ success: false, message: "Coupon has expired" });
        }

        if (cartTotal < coupon.minPurchaseAmount) {
            return res.json({ success: false, message: `Minimum purchase of $${coupon.minPurchaseAmount} required` });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed cart total
        discountAmount = Math.min(discountAmount, cartTotal);

        res.json({
            success: true,
            message: "Coupon applied successfully",
            discountAmount,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minPurchaseAmount: coupon.minPurchaseAmount
            }
        });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};
