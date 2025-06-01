const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

//Route for handling news letter subscription
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required!" });
  }

  try {
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      res.status(400).json({ message: "Email is already subscribed!" });
    }

    // Create new subscriber if email is not subscribed already.
    subscriber = new Subscriber({ email });
    subscriber.save();

    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
