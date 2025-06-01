const express = require("express");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

//Register new user route

router.post("/register", async(req, res) => {
    const {name, email, password} = req.body;
    try{
        // res.send({name, email, password});
        //Registration Logic
        let user = await User.findOne({email});

        if (user) res.status(400).json({message: "User already exist with this email!"});

        user = new User ({name, email, password});
        await user.save();
        //JasonWeb Token Payload
        const payload = {user :{id : user._id, role: user.role}};

        //Signing and returning the token with user data
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"48h"}, (err, token) =>{
            if(err) throw err;
            //Send the user & token in response
            res.status(201).json({
            user: {
                _id: user._id,
                name:user.name,     
                email: user.email,
                role:user.role,      
            },
            token,
        })
        });
    }catch (err) {
        console.log(err);
        res.status(500).send("Sever Error");
    };
});

//Login Route
router.post("/login", async(req, res) => {
    const {email, password} = req.body;

    try{
        //Find the user by email
        let user = await User.findOne({email});
        if (!user) return res.status(400).json({message:"Invalid credentials, please check your email and password!"});
        const isMatch =await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({message:"Incorrect credentials!"});

         //JasonWeb Token Payload
        const payload = {user :{id : user._id, role: user.role}};

        //Signing and returning the token with user data
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"96h"}, (err, token) =>{
            if(err) throw err;
            //Send the user & token in response
            res.json({
            user: {
                _id: user._id,
                name:user.name,     
                email: user.email,
                role:user.role,      
            },
            token,
        })
        });
    }catch (error) {
        console.error(error);
        res.status(500).send("Server error!");
    };
});

//User Profile Route
router.get("/profile", protect , async(req, res) => {
    res.json(req.user);
})

module.exports=router;