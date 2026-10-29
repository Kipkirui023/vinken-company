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
  const { customer_id, contact_person, email, phone, subject, message } =
    inquiryData;

  const inquiryColumns = await getInquiryColumns();
  const hasCustomerId = inquiryColumns.has("customer_id");
  const hasContactName = inquiryColumns.has("name");
  const hasEmail = inquiryColumns.has("email");
  const hasPhone = inquiryColumns.has("phone");

  const insertColumns = [];
  const insertValues = [];

  if (hasCustomerId) {
    insertColumns.push("customer_id");
    insertValues.push(customer_id ?? null);
  }

  if (hasContactName) {
    const contactName = String(contact_person || "").trim();
    if (!contactName) {
      throw new Error("Contact person is required.");
    }
    insertColumns.push("name");
    insertValues.push(contactName);
  }

  if (hasEmail) {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) {
      throw new Error("Email address is required.");
    }
    insertColumns.push("email");
    insertValues.push(normalizedEmail);
  }

  if (hasPhone) {
    insertColumns.push("phone");
    insertValues.push(phone ? String(phone).trim() : null);
  }

  insertColumns.push("subject");
  insertValues.push(subject || "General Inquiry");

  insertColumns.push("message");
  insertValues.push(message);

  if (insertColumns.length === 0) {
    throw new Error(
      "Unsupported inquiry schema: no insertable message fields found.",
    );
  }

  const placeholders = insertColumns.map(() => "?").join(", ");
  const [result] = await db.query(
    `INSERT INTO inquiries (${insertColumns.join(", ")}) VALUES (${placeholders})`,
    insertValues,
  );

  return result.insertId;
}

// ========================================
// GET ALL INQUIRIES
// ========================================

async function getAllInquiries() {
  const inquiryColumns = await getInquiryColumns();
  const hasCustomerId = inquiryColumns.has("customer_id");
  const hasLegacyContactFields =
    inquiryColumns.has("name") && inquiryColumns.has("email");

  if (hasCustomerId) {
    const [rows] = await db.query(
      `
          SELECT
              inquiries.id,
              inquiries.subject,
              inquiries.message,
              inquiries.status,
              inquiries.created_at,
              customers.organization_name,
              COALESCE(customers.contact_person, inquiries.name) AS contact_person,
              COALESCE(customers.email, inquiries.email) AS email,
              COALESCE(customers.phone, inquiries.phone) AS phone

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
  const hasCustomerId = inquiryColumns.has("customer_id");

  if (hasCustomerId) {
    const [rows] = await db.query(
      `
          SELECT
              inquiries.id,
              inquiries.subject,
              inquiries.message,
              inquiries.status,
              inquiries.created_at,
              customers.organization_name,
              COALESCE(customers.contact_person, inquiries.name) AS contact_person,
              COALESCE(customers.email, inquiries.email) AS email,
              COALESCE(customers.phone, inquiries.phone) AS phone

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
