const router = require("express").Router();
const { ROLE } = require("../../config/roles");
const { getRangeOfProducts, getProductByCategory, getProductByName, getProductById } = require("../../controllers/products");
const {
  userAuth,
  userLogin,
  checkRole,
  userRegister,
  serializeUser,
} = require("../../controllers/auth");

const Users = require("../../models/user.models");

router.get("/", async (req, res) => {
  return res.send("Auth service running...");
});
router.get("/get-product-category/:category", getProductByCategory);

router.get("/name/:name", getProductByName);
router.get("/get-product/:id", getProductById);


// Get All Users Data According to Role
router.get("/getAllUsers", async (req, res) => {
  const { role } = req.query;

  // Check if role is provided and valid
  if (!role || !Object.values(ROLE).includes(role)) {
    return res.status(400).send({ status: "error", message: "Invalid role" });
  }

  try {
    const allUsers = await Users.find({ role: role });
    return res.send({ status: "ok", data: allUsers });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: "error", message: "Internal server error" });
  }
});

// Users Registration Route
router.post("/signup", async (req, res) => {
  await userRegister(req.body, ROLE.user, res);
});

// Admin Registration Route
router.post("/signup-admin", async (req, res) => {
  await userRegister(req.body, ROLE.admin, res);
});

// Users Login Route
router.post("/login", async (req, res) => {
  await userLogin(req.body, ROLE.user, res);
});

// Admin Login Route
router.post("/login-admin", async (req, res) => {
  await userLogin(req.body, ROLE.admin, res);
});

router.get('/products/range', getRangeOfProducts);



module.exports = router;
