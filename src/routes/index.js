const router = require("express").Router();
const { userAuth, checkRole, serializeUser } = require("../controllers/auth");
const { ROLE } = require("../config/roles");
const passport = require("passport");

router.get("/", (req, res) => {
  res.send("Api running...");
});
// Authentication Router Middleware
router.use("/auth", require("./auth"));

// Admin Protected Route
router.use("/admin", userAuth, checkRole([ROLE.admin]), require("./admin"));

// Users Protected Route
router.use("/user", userAuth, checkRole([ROLE.user]), require("./user"));

module.exports = router;
