const db = require("../config/db");

// ========================================
// CREATE INQUIRY
// ========================================

async function createInquiry(inquiryData) {
  const { customer_id, subject, message } = inquiryData;

  const [result] = await db.query(
    `
        INSERT INTO inquiries
        (
            customer_id,
            subject,
            message
        )
        VALUES (?, ?, ?)
        `,
    [customer_id, subject, message],
  );

  return result.insertId;
}

// ========================================
// GET ALL INQUIRIES
// ========================================

async function getAllInquiries() {
  const [rows] = await db.query(
    `
        SELECT
            inquiries.id,
            inquiries.subject,
            inquiries.message,
            inquiries.status,
            inquiries.created_at,

            customers.organization_name,
            customers.contact_person,
            customers.email,
            customers.phone

        FROM inquiries

        LEFT JOIN customers
        ON inquiries.customer_id = customers.id

        ORDER BY inquiries.created_at DESC
        `,
  );

  return rows;
}

// ========================================
// GET INQUIRY BY ID
// ========================================

async function getInquiryById(id) {
  const [rows] = await db.query(
    `
        SELECT
            inquiries.id,
            inquiries.subject,
            inquiries.message,
            inquiries.status,
            inquiries.created_at,

            customers.organization_name,
            customers.contact_person,
            customers.email,
            customers.phone

        FROM inquiries

        LEFT JOIN customers
        ON inquiries.customer_id = customers.id

        WHERE inquiries.id = ?
        `,
    [id],
  );

  return rows[0];
}

// ========================================
// EXPORT FUNCTIONS
// ========================================

module.exports = {
  createInquiry,
  getAllInquiries,
  getInquiryById,
};
