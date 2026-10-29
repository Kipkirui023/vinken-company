const db = require("../config/db");

async function getInquiryColumns() {
  const [rows] = await db.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'inquiries'
    `,
  );

  return new Set(rows.map((row) => row.column_name));
}

// ========================================
// CREATE INQUIRY
// ========================================

async function createInquiry(inquiryData) {
  const {
    customer_id,
    contact_person,
    email,
    phone,
    subject,
    message,
  } = inquiryData;

  const inquiryColumns = await getInquiryColumns();

  if (inquiryColumns.has("customer_id")) {
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
      [customer_id ?? null, subject || "General Inquiry", message],
    );

    return result.insertId;
  }

  const [result] = await db.query(
    `
        INSERT INTO inquiries
        (
            name,
            email,
            phone,
            subject,
            message
        )
        VALUES (?, ?, ?, ?, ?)
        `,
    [
      contact_person || null,
      email || null,
      phone || null,
      subject || "General Inquiry",
      message,
    ],
  );

  return result.insertId;
}

// ========================================
// GET ALL INQUIRIES
// ========================================

async function getAllInquiries() {
  const inquiryColumns = await getInquiryColumns();

  if (inquiryColumns.has("customer_id")) {
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

  const [rows] = await db.query(
    `
        SELECT
            inquiries.id,
            inquiries.subject,
            inquiries.message,
            inquiries.status,
            inquiries.created_at,
            NULL AS organization_name,
            inquiries.name AS contact_person,
            inquiries.email,
            inquiries.phone

        FROM inquiries

        ORDER BY inquiries.created_at DESC
        `,
  );

  return rows;
}

// ========================================
// GET INQUIRY BY ID
// ========================================

async function getInquiryById(id) {
  const inquiryColumns = await getInquiryColumns();

  if (inquiryColumns.has("customer_id")) {
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

  const [rows] = await db.query(
    `
        SELECT
            inquiries.id,
            inquiries.subject,
            inquiries.message,
            inquiries.status,
            inquiries.created_at,
            NULL AS organization_name,
            inquiries.name AS contact_person,
            inquiries.email,
            inquiries.phone

        FROM inquiries

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
