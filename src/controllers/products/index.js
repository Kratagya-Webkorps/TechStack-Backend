const Product = require("../../models/product.models");
const Cart = require("../../models/cart.models");
const Wishlist = require("../../models/wishlist.models");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getRangeOfProducts = async (req, res) => {
  const { start, end } = req.query;

  if (start === undefined || end === undefined) {
    return res
      .status(400)
      .json({ error: "Please provide both start and end query parameters" });
  }

  const startIdx = parseInt(start, 10);
  const endIdx = parseInt(end, 10);

  if (isNaN(startIdx) || isNaN(endIdx)) {
    return res
      .status(400)
      .json({ error: "Start and end query parameters must be valid numbers" });
  }

  try {
    const products = await Product.find()
      .skip(startIdx)
      .limit(endIdx - startIdx + 1);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    const products = await Product.find({
      name: { $regex: `^${name}`, $options: "i" },
    });

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching product by name:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductByCategory = async (req, res) => {
  const { start, end } = req.query;
  if (start === undefined || end === undefined) {
    return res
      .status(400)
      .json({ error: "Please provide both start and end query parameters" });
  }

  const category = req.params.category;
  const startIdx = parseInt(start, 10);
  const endIdx = parseInt(end, 10);
  if (isNaN(startIdx) || isNaN(endIdx)) {
    return res
      .status(400)
      .json({ error: "Start and end query parameters must be valid numbers" });
  }
  try {
    const products = await Product.find({ category })
      .skip(startIdx)
      .limit(endIdx - start + 1);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const file = req.files.productImage;
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    const imageUrl = result.url;

    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !stock) {
      return res.status(400).json({
        error: "Please provide name, description, and price",
      });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      productImage: imageUrl,
      category,
      stock,
    });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, stock } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update fields if provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller function to delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.remove();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addProductToCart = async (req, res) => {
  try {
    const { username, productId, quantity } = req.body;
    let cart = await Cart.findOne({ username });

    if (!cart) {
      cart = new Cart({ username, products: [] });
    }

    const productIndex = cart.products.findIndex(
      (product) => product.productId === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();

    res
      .status(200)
      .json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteProductFromCart = async (req, res) => {
  try {
    const { username, productId } = req.body;

    // Find the cart for the specified user
    let cart = await Cart.findOne({ username });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    // Find the index of the product in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId === productId
    );

    if (productIndex > -1) {
      // Remove the product from the cart
      cart.products.splice(productIndex, 1);
      await cart.save();
      res
        .status(200)
        .json({ message: "Product removed from cart successfully", cart });
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCartProducts = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the cart for the specified user
    const cart = await Cart.findOne({ username });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addProductToWishlist = async (req, res) => {
  try {
    const { username, productId } = req.body;
    let wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      wishlist = new Wishlist({ username, products: [] });
    }

    const productExists = wishlist.products.some(
      (product) => product.productId.toString() === productId.toString()
    );

    if (productExists) {
      return res
        .status(200)
        .json({ message: "Product already in wishlist", wishlist });
    }

    wishlist.products.push({ productId });
    await wishlist.save();

    res
      .status(200)
      .json({ message: "Product added to wishlist successfully", wishlist });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllWishlistProducts = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the cart for the specified user
    const wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const removeFromWishlist = async (req, res) => {
  const { username, productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ username });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (product) => product.productId !== productId
    );

    await wishlist.save();

    res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductToCart,
  deleteProductFromCart,
  getAllCartProducts,
  getRangeOfProducts,
  getProductByName,
  addProductToWishlist,
  getAllWishlistProducts,
  removeFromWishlist,
};
