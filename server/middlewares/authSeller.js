import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.json({ success: false, message: "Not Authorized" });
  }
  try {
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
    // Check if it's the admin seller
    if (tokenDecode.isAdmin && tokenDecode.email === process.env.SELLER_EMAIL) {
      req.isAdmin = true;
      next();
      return;
    }
    
    // Regular seller
    if (tokenDecode.id) {
      req.sellerId = tokenDecode.id;
      next();
      return;
    }
    
    return res.json({ success: false, message: "Not Authorized" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default authSeller;
