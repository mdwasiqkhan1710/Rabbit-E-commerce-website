const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const {protect, adminCheck} = require("../middleware/authMiddleware");

//Route for fecthing all orders of admin
router.get("/", protect, adminCheck, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    };
});

//Route for updating Order status
router.put("/:id", protect, adminCheck, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name");

        if(order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({message: "Order not found with provided Order ID"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error!"})
    }
});

//Route for deleting the Order
router.delete("/:id", protect, adminCheck, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id );

        if(order) {
            await order.deleteOne();
            res.json({message: "Order deleted successfully"});
        } else {
            res.status(404).json({message: "No Order found for this Order Id"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

module.exports=router;