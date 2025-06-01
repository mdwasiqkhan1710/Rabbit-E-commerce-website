const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Products");
const User = require("./models/Users");
const products = require("./data/products");
const Cart = require("./models/Cart");

dotenv.config();

//Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI);

//Function to seed the raw data
const seedData = async (req, res) => {
    try {
        //Delete the already exisiting data everytime the file is runned
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        //Creating a default Admin User
        const createdUser = await User.create({
            name: "Wasiq-admin",
            email: "admin@example.com",
            password: "123456", 
            role: "admin",
        });

        //Assigning the default User Id to each product
        const userID = createdUser._id;
        const sampleProducts = products.map((product) => {
            return {...product, user : userID};
        });

        //Inserting the products in database
        await Product.insertMany(sampleProducts);

        console.log("Product data seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding the data!", error);
        process.exit(1);
    }
};


seedData();