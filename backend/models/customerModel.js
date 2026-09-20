const db = require("../config/db");

// ========================================
// FIND CUSTOMER BY EMAIL
// ========================================

async function getCustomerByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM customers WHERE email = ? LIMIT 1",
    [email],
  );

  return rows[0];
}

// ========================================
// CREATE CUSTOMER
// ========================================

async function createCustomer(customerData) {
  const { organization_name, contact_person, email, phone, address } =
    customerData;

  const [result] = await db.query(
    `
        INSERT INTO customers
        (
            organization_name,
            contact_person,
            email,
            phone,
            address
        )
        VALUES (?, ?, ?, ?, ?)
        `,
    [organization_name, contact_person, email, phone, address],
  );

  return result.insertId;
}

// ========================================
// GET CUSTOMER BY ID
// ========================================

async function getCustomerById(id) {
  const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);

  return rows[0];
}

// ========================================
// EXPORT FUNCTIONS
// ========================================

module.exports = {
  getCustomerByEmail,
  createCustomer,
  getCustomerById,
};
