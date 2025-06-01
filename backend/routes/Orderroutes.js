const express = require("express");
const Order = require("../models/Order");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

//Route for fecting Orders of a Logged in user
router.get("/my-orders", protect, async(req, res) => {
    try {
        //find the orders for the authenticated user
        const orders = await Order.find({user: req.user._id}).sort({createdAt: -1});
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

//Route for fetching Order details by Id
router.get("/:id", protect, async(req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if(!order) {
            res.status(404).json({message: "Order not found!"})
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error!"});
    }
});

module.exports = router;