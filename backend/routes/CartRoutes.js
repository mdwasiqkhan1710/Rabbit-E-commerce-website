const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Products");
const {protect} = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

//Helper function to get cart by User Id or Guest Id
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({user: userId});
    }else if (guestId) {
        return await Cart.findOne({guestId});
    }
    return null;
};

//Route for adding product to cart for guest or logged in user 
router.post("/", async(req, res) => {
    const {productId, quantity, size, color, guestId, userId} = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  };

//     // Validate quantity
//   const quantity = Number(req.body.quantity);
//   if (isNaN(quantity) || quantity < 1) {
//     return res.status(400).json({ message: "Invalid quantity value" });
//   }

    try {
        const product = await Product.findById(productId);
        if(!product) {
            return res.status(404).json({message: "Product not found!"});
        }
        //Determine if the user is logged in or guest
        let cart = await getCart(userId, guestId);

        //If cart exist update it
        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) =>
                    p.productId.toString() === productId &&
                    p.size === size &&
                    p.color === color
            );

            if (productIndex > -1) {
                //if product already exist update the quantity
                cart.products[productIndex].quantity += quantity;
            } else {
                //Product is not present thus add new product
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: Number(product.price),
                    size,
                    color,
                    quantity,
                });
            }

            //Recalculate the total price
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);

            await cart.save();
            return res.status(200).json(cart);
        } else {
            //create new cart for guest
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        price: Number(product.price),
                        size, 
                        color,
                        quantity
                    },
                ],
                totalPrice: Number(product.price) * quantity,
            });

            return res.status(201).json(newCart);
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

//Route for U=updating quantity in Cart
router.put("/", async(req, res) => {
    const { productId, size, color, guestId, userId } = req.body;
    const quantity = Number(req.body.quantity);

    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({message:"Product not found!"});

        const productIndex = cart.products.findIndex((p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
        );

        if (productIndex > -1) {
            //Update Quantity
            if (quantity>0) {
                cart.products[productIndex].quantity = quantity;
            } else {
                cart.products.splice(productIndex, 1); 
            }

            cart.totalPrice = cart.products.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

            await cart.save();
            return res.status(200).json(cart);
        } else {
            res.status(404).json({message: "Product not found in the cart!"});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

//Route for deleting the product from cart
router.delete("/", async(req, res) => {
    const {productId, size, color, guestId, userId} = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({message: "Product not found in the cart"});

        const productIndex = cart.products.findIndex((p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            res.status(200).json(cart);
        } else {
            return res.status(404).json({message: "Product not found in cart!"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Sever Error!"})
    }
});

//Route for getting guest user or logged in user cart
router.get("/", async(req, res) => {
    const {userId, guestId} = req.query;

    try {
        const cart = getCart(userId, guestId);
        if (cart){
            res.json(cart);
        } else {
            res.status(404).json({message: "Cart not found!"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error!"});
    }
});

//Route for merging Guest Cart into Logged in user cart so that data is not lost
router.post("/merge", protect, async(req, res) => {
    const {guestId} = req.body;
    try {
        //Find the Guest cart and user cart
        const guestCart = await Cart.findOne({guestId});
        const userCart = await Cart.findOne({user : req.user._id});

        if (guestCart) {
            if (guestCart.products.length === 0) {
                return res.status(400).json({message: "Guest Cart is empty!"})
            }

            if (userCart) {
                //merge guest cart into user cart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = user.products.findIndex(
                        (item) =>
                            item.productId.toString() === guestItem.productId.toString() &&
                            item.size === guestItem.size &&
                            item.color === guestItem.color
                    );

                    if (productIndex > -1) {
                        //If items exits in the cart then just update the quantity
                        userCart.products[productIndex].quantity += guestItem.quantity;
                    } else {
                        //If the items don't exits then just add them to the cart
                        userCart.products.push(guestItem);
                    }
                });
                userCart.totalPrice = userCart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
                await userCart.save();

                //Remove guest cart after merging
                try {
                    await Cart.findOneAndDelete({guestId});
                } catch (error) {
                    console.error( "Error deleting guest cart: ",error);
                }
                res.status(200).json(userCart);
            } else {
                // If user has no existing cart then assign the guest cart to the user
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart);
            }
        } else {
            if (userCart) {
                // Guest Cart has already been merged then just return the usercart
                return res.status(200).json(userCart);
            }
            res.status(400).json({message: "Guest Cart not found!"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error!"});
    }
})

module.exports = router;