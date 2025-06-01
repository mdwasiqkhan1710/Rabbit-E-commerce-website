const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/CartRoutes");
const checkoutRoutes = require("./routes/CheckoutRoutes");
const orderRoutes = require("./routes/Orderroutes");
const uploadRoutes = require("./routes/UploadRoutes");
const subscribeRoutes = require("./routes/SubscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const orderAdminRoutes = require("./routes/adminOrderRoute")

const app = express();
app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
dotenv.config();

const PORT = process.env.PORT || 9000;
connectDB();

//API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/", subscribeRoutes);

//Admin Routes
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", orderAdminRoutes);


app.use("/", (req, res) => {
    res.send("Welcome to Rabbit!")
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});