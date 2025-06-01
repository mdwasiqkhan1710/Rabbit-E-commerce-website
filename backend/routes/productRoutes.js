const express = require("express");
const Product = require("../models/Products");

const { protect, adminCheck } = require("../middleware/authMiddleware");

const router = express.Router();

//Create new Product
router.post("/", protect, adminCheck, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      colors,
      sizes,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      colors,
      sizes,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, //this refers to the admin who is creating the product
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!!");
  }
});

//Update Route
router.put("/:id", protect, adminCheck, async (req, res) => {
    try {
        const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      colors,
      sizes,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    //Find product by product id

    const product = await Product.findById(req.params.id);
    if (product) {
        //Update product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.discountPrice = discountPrice || product.discountPrice;
        product.countInStock = countInStock || product.countInStock;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.sizes = sizes || product.sizes;
        product.colors = colors || product.colors;
        product.collections = collections || product.collections;
        product.material = material || product.material;
        product.gender = gender || product.gender;
        product.images = images || product.images;
        product.isFeatured = isFeatured != undefined ? isFeatured : product.isFeatured;
        product.isPublished = isPublished != undefined ? isPublished : product.isPublished;
        product.tags = tags || product.tags;
        product.dimensions = dimensions || product.dimensions;
        product.weight = weight || product.weight;
        product.sku = sku || product.sku;

        //Save the updated product to database
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({message: "Product not found!"})
    }

    }catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

//Delete Route
router.delete("/:id", protect, adminCheck, async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        //Finding the product by id and deleting it
        if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }else {
        await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product removed successfully" });
      }

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error!")
    }
} );

//Get all products route with optional filters
router.get("/", async (req, res) => {
    try {
        const {collection, size, color, gender, minPrice, maxPrice, sortBy, search, category, material, brand, limit} = req.query;

        let query = {};

        //Filter Logic

        if(collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }

        if(category && category.toLocaleLowerCase() !== "all") {
            query.category = category;
        }

        if (material) {
            query.material = {$in: material.split(",")};
        }

        if (brand) {
            query.brand = {$in: brand.split(",")};
        }

        if (size) {
            query.size = {$in: sizes.split(",")};
        }

        if (color) {
            query.colors = {$in: [color]};
        }

        if (gender) {
            query.gender = gender;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (search) {
            query.$or = [
                {name :{ $regex: search, $options: "i"}},
                {description :{ $regex: search, $options: "i"}},
            ];
        }

        //Sorting Logic
        let sort = {};
        if (sortBy) {
            switch(sortBy){
                case "priceAsc" :
                    sort = {price: 1};
                    break;
                    case "priceDesc" :
                    sort = {price: -1};
                    break;
                    case "popularity" :
                    sort = {rating: -1};
                    break;
                    default:
                        break;
            }
        }

        //Fetch products, then apply sorting & limit
        let products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Sever Error!"});
    }
});

//Best Seller Route
router.get("/best-seller", async (req, res) => {
    try {
        const bestSeller = await Product.findOne().sort({rating:-1});
        if (bestSeller) {
            res.json(bestSeller);
        } else {
            res.status(404).json({message: "No best seller product found!"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error!");
    }
});

//New arrivals route, products will be fecthed based on the creation date.
router.get("/new-arrivals", async(req, res) => {
    try {
        const newArrivals = await Product.find().sort({createdAt: -1}).limit(8);
        res.json(newArrivals);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

//Fecth single product by it's ProductID
router.get("/:id", async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if(product) {
            res.json(product);
        } else {
            res.status(404).json({message: "Product Not Found!!"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error!")
    }
});

//Display similar products on detail page
router.get("/similar/:id", async(req, res) => {
    const {id} = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({message: "Product not found!"});
        }

        const similarProducts = await Product.find({
            _id: {$ne : id}, //removing the current product from the results
            gender: product.gender,
            category: product.category,
        }).limit(4);

        res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error!");
    }
});

module.exports = router;