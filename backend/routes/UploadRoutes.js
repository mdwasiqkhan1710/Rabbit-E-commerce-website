const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const dotenv = require("dotenv");

dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Stream upload function should be defined outside the route handler
const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
            if(result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// route handler
router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await streamUpload(req.file.buffer);
        
        res.json({ 
            imageUrl: result.secure_url,
            publicId: result.public_id 
        });
        
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ 
            message: "Server Error",
            error: error.message 
        });
    }
});

module.exports = router;