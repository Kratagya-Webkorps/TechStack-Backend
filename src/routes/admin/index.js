const router = require("express").Router();
const { serializeUser, userPasswordCheck } = require("../../controllers/auth");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByCategory,
  addProductToCart,
  getAllCartProducts,
  getProductByName,
  addProductToWishlist,
  getAllWishlistProducts,
} = require("../../controllers/products");

router.get("/", async (req, res) => {
  return res.status(200).json({ type: "admin", user: serializeUser(req.user) });
});

router.get("/getall", getAllProducts);
router.get("/get-product/:id", getProductById);
router.get("/name/:name", getProductByName); 
router.get("/get-product-category/:category", getProductByCategory);
router.post("/create", createProduct);
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);
router.post("/add-to-cart", addProductToCart);
router.post("/add-to-wishlist", addProductToWishlist);
router.post("/get-cart", getAllCartProducts);
router.post("/get-wishlist", getAllWishlistProducts);

module.exports = router;
