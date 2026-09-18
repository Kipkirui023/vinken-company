const db = require("../config/db");

// Get all products
const getAllProducts = async () => {
  const [rows] = await db.query(`
        SELECT 
            products.id,
            products.name,
            products.description,
            products.specifications,
            products.image,
            products.status,
            categories.name AS category
        FROM products
        LEFT JOIN categories
            ON products.category_id = categories.id
        WHERE products.status = 'active'
        ORDER BY products.created_at DESC
    `);

  return rows;
};

// Get one product
const getProductById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT 
            products.id,
            products.name,
            products.description,
            products.specifications,
            products.image,
            products.status,
            categories.name AS category
        FROM products
        LEFT JOIN categories
            ON products.category_id = categories.id
        WHERE products.id = ?
    `,
    [id],
  );

  return rows[0];
};

// Create product
const createProduct = async (product) => {
  const { category_id, name, description, specifications, image } = product;

  const [result] = await db.query(
    `
        INSERT INTO products
        (category_id, name, description, specifications, image)
        VALUES (?, ?, ?, ?, ?)
    `,
    [category_id, name, description, specifications, image],
  );

  return result.insertId;
};

// Delete product
const deleteProduct = async (id) => {
  const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);

  return result.affectedRows;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
};
