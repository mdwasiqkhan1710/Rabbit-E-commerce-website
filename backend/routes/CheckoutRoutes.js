const express = require("express");
const Checkout = require("../models/CheckOut");
const Cart = require("../models/Cart");
const Product = require("../models/Products");
const Order = require("../models/Order");

const { protect, validateMongoId } = require("../middleware/authMiddleware");
const CheckOut = require("../models/CheckOut");
const router = express.Router();

//Route for creating new Checkout session
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, totalPrice, paymentMethod } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    res.status(400).json({ message: "No items in checkout" });
  }

  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems: checkoutItems,
      shippingAddress,
      totalPrice,
      paymentMethod,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log(`Checkout created for the user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout session: ", error);
    res.status(500).json({ message: "Server Error" });
  }
});

//Route for updating checkout to mark as paid after successful payment
router.put("/:id/pay", protect, validateMongoId, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(400).json({ message: "Checkout not found!" });
    }

    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();

      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Invalid payment method!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//Route for finilizing checkout and converting it into order after payment is confirmed
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      res.status(404).json({ message: "Checkout not found!" });
    }

    if (checkout.isPaid && !checkout.isFinalized) {
      //create final order based on checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });

      //Mark checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      //Delete the cart associated with the user
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout is already finalized!" });
    } else {
      res.status(400).json({ message: "Checkout is not paid!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error!" });
  }
});

module.exports = router;
