//Add Address : /api/address/add
import Address from "../../models/Address.js";
import User from "../../models/User.js";

export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.userId;

    // Create the address with the user ID from the authenticated request
    const newAddress = await Address.create({ ...address, userId });
    
    // Return the created address in the response
    res.json({ 
      success: true, 
      message: "Address added successfully",
      address: newAddress
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//Get Address : /api/address/get

export const getAddress = async (req, res) => {
  try {
    // Use the authenticated user ID if no specific userId is provided
    const userId = req.query.userId || req.userId;
    
    // Find all addresses for this user
    const addresses = await Address.find({ userId });
    
    // Log for debugging
    console.log(`Found ${addresses.length} addresses for user ${userId}`);
    
    res.json({ success: true, addresses });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
