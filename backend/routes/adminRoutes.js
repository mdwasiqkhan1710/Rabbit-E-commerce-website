const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const {protect, adminCheck} = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
        algorithm: 'HS256'
    });
};

//Route for getting all users for Admin only
router.get("/", protect, adminCheck, async(req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

//Route for allowing admin to add new users
router.post("/", protect, adminCheck, async(req, res) => {
    const {name, email, password, role} = req.body;

    try {
        let user = await User.findOne({email});
        if (user) {
            res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id) // MUST include this
        });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "customer",
        });

        await user.save();

        res.status(201).json({message: "User created successfully", user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

//Route for allowing admin to update user details except password
router.put("/:id", protect, adminCheck, async(req,res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
        };

        const updatedUser = await user.save();
        res.json({message: "User updated successfully", user:updatedUser})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
});

//Route for deleteing the existing user
router.delete("/:id", protect, adminCheck, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(user) {
            await user.deleteOne();
            res.json({message: "User deleted successfully!"});
        } else {
            res.status(404).json({message: "No user found with this Id!"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error!"});
    }
});

module.exports=router;