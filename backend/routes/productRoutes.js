const express = require("express");

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
router.post("/", addProduct);

// DELETE product
router.delete("/:id", removeProduct);

module.exports = router;
