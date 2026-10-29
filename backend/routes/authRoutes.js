const express = require("express");
const {
  signupCustomer,
  loginCustomer,
  getCurrentCustomer,
} = require("../controllers/authController");
const requireCustomerAuth = require("../middleware/requireCustomerAuth");

const router = express.Router();

router.post("/signup", signupCustomer);
router.post("/login", loginCustomer);
router.get("/me", requireCustomerAuth, getCurrentCustomer);

module.exports = router;
