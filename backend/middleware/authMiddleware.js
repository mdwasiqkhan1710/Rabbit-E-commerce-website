const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const mongoose = require("mongoose");
const asyncHandler = require('express-async-handler');

//Middleware to protect routes
// const protect = async(req, res, next) => {
//     console.log("Authorization header:", req.headers.authorization);
    

//     if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//             res.status(401);
//         throw new Error('Invalid authorization format');
//         }try {
//         const token = req.headers.authorization.split(" ")[1];
//         console.log("Extracted token:", token);

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log("Decoded token:", decoded);


//         req.user = await User.findById(decoded.id).select("-password");
//         next();
//     } catch(error) {
//         console.error("Token verification failed", error);
//         res.status(401).json({message:"Not authorized token failed!"});       
//     }
    
//     // else {
//     //     res.status(401).json({message: "Not authorzied no token provided"});
//     // }
// };

const protect = asyncHandler(async (req, res, next) => {
    let token;
    // Check if authorization header exists
    if (!req.headers.authorization) {
        res.status(401);
        throw new Error('Authorization header missing');
    }
    
    if (!req.headers.authorization.startsWith('Bearer')) {
        res.status(401);
        throw new Error('Invalid authorization format');
    }
    
    token = req.headers.authorization.split(' ')[1];
    
    // Check if token exists
    if (!token) {
        res.status(401);
        throw new Error('Token not found in authorization header');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.user.id).select('-password');
        next();
    } catch (error) {
        console.error('Token verification failed', error);
        res.status(401);
        throw new Error('Not authorized');
    }
});

//Middleware to check if the user is Admin

const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({message: "You are not authorized as Admin!!"});
    }
};

//Validating Mongo Id middleware
const validateMongoId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
};

module.exports = {protect, adminCheck, validateMongoId};