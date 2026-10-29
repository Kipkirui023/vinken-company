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

async function hasColumn(tableName, columnName) {
  const [rows] = await db.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1
    `,
    [tableName, columnName],
  );

  return rows.length > 0;
}

async function createCustomer(customerData) {
  const {
    organization_name,
    contact_person,
    email,
    phone,
    address,
    password_hash,
  } = customerData;

  const hasPasswordHash = await hasColumn("customers", "password_hash");
  const columns = [
    "organization_name",
    "contact_person",
    "email",
    "phone",
    "address",
  ];
  const values = [organization_name, contact_person, email, phone, address];

  if (hasPasswordHash && password_hash) {
    columns.push("password_hash");
    values.push(password_hash);
  }

  const [result] = await db.query(
    `
        INSERT INTO customers
        (
            ${columns.join(", ")}
        )
        VALUES (${columns.map(() => "?").join(", ")})
        RETURNING id
        `,
    values,
  );

  return result.insertId ?? result.rows?.[0]?.id;
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
