const express = require("express");
const requireAdminApiKey = require("../middleware/requireAdminApiKey");

const router = express.Router();

const {
  getProducts,
  getProduct,
  addProduct,
  removeProduct,
} = require("../controllers/productController");

// GET all products
router.get("/", getProducts);

// GET one product
router.get("/:id", getProduct);

// POST new product
router.post("/", requireAdminApiKey, addProduct);

// DELETE product
router.delete("/:id", requireAdminApiKey, removeProduct);

module.exports = router;
