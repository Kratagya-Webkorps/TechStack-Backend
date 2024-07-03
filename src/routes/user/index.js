const router = require("express").Router();
const { ROLE } = require("../../config/roles");
const {
  serializeUser,
  userPasswordCheck,
  userPasswordChange,
} = require("../../controllers/auth");
const Razorpay = require("razorpay");

const {
  getProductById,
  addProductToCart,
  getAllCartProducts,
  addProductToWishlist,
  getAllWishlistProducts,
  deleteProductFromCart,
  removeFromWishlist,
} = require("../../controllers/products");
const { createOrder, getAllOrdersData } = require("../../controllers/orders");

router.get("/", async (req, res) => {
  return res.status(200).json({ type: "user", user: serializeUser(req.user) });
});

router.post("/checkPassword", async (req, res) => {
  await userPasswordCheck(req.body, ROLE.user, res);
});
router.post("/updatePassword", async (req, res) => {
  await userPasswordChange(req.body, res);
});
router.get("/get-product/:id", getProductById);
router.post("/add-to-cart", addProductToCart);
router.delete("/delete-from-cart", deleteProductFromCart);
router.post("/get-cart", getAllCartProducts);
router.post("/get-orders", getAllOrdersData);
router.post("/add-to-wishlist", addProductToWishlist);
router.post("/get-wishlist", getAllWishlistProducts);
router.post("/delete-from-wishlist", removeFromWishlist);
router.post("/orders", async (req, res) => {
  const { amount, currency } = req.body;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
  });
  const options = {
    amount: amount,
    currency: currency,
    receipt: "receipt#1",
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);
    const { id, amount, currency } = response;
    res.json({
      order_id: id,
      currency: currency,
      amount: amount,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
  });
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment) {
      return res.status(500).json("Error at razorpay loading");
    }
    const { status, method, amount, currency } = payment;
    res.json({
      status: status,
      method: method,
      amount: amount,
      currency: currency,
    });
  } catch (error) {
    return res.status(500).json("Failed to fetch");
  }
});

router.post("/:username/create-order", createOrder);
module.exports = router;
