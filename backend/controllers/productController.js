const productModel = require("../models/productModel");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// Create product
const addProduct = async (req, res) => {
  try {
    const { category_id, name, description, specifications, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const productId = await productModel.createProduct({
      category_id,
      name,
      description,
      specifications,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// Delete product
const removeProduct = async (req, res) => {
  try {
    const deleted = await productModel.deleteProduct(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  removeProduct,
};
