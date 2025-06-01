const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const {protect, adminCheck} = require("../middleware/authMiddleware");

//Route for fecthing all products 
router.get("/", protect, adminCheck, async(req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error!"})
    }
});

module.exports=router;