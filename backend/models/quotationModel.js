const db = require("../config/db");

// ========================================
// CREATE QUOTATION REQUEST
// ========================================

async function createQuotationRequest(data) {
  const {
    customer_id,
    product_service,
    quantity,
    delivery_location,
    tender_lpo_reference,
    requirement_type,
    required_delivery_date,
    additional_requirements,
  } = data;

  const [result] = await db.query(
    `
        INSERT INTO quotation_requests
        (
            customer_id,
            product_service,
            quantity,
            delivery_location,
            tender_lpo_reference,
            requirement_type,
            required_delivery_date,
            additional_requirements
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
    [
      customer_id || null,
      product_service,
      quantity || null,
      delivery_location || null,
      tender_lpo_reference || null,
      requirement_type || "Quotation",
      required_delivery_date || null,
      additional_requirements || null,
    ],
  );

  return result.insertId;
}

// ========================================
// GET ALL QUOTATION REQUESTS
// ========================================

async function getAllQuotationRequests() {
  const [rows] = await db.query(
    `
        SELECT
            qr.id,
            qr.product_service,
            qr.quantity,
            qr.delivery_location,
            qr.tender_lpo_reference,
            qr.requirement_type,
            qr.required_delivery_date,
            qr.additional_requirements,
            qr.status,
            qr.created_at,

            c.organization_name,
            c.contact_person,
            c.email,
            c.phone

        FROM quotation_requests qr

        LEFT JOIN customers c
        ON qr.customer_id = c.id

        ORDER BY qr.created_at DESC
        `,
  );

  return rows;
}

// ========================================
// GET QUOTATION REQUEST BY ID
// ========================================

async function getQuotationRequestById(id) {
  const [rows] = await db.query(
    `
        SELECT
            qr.id,
            qr.product_service,
            qr.quantity,
            qr.delivery_location,
            qr.tender_lpo_reference,
            qr.requirement_type,
            qr.required_delivery_date,
            qr.additional_requirements,
            qr.status,
            qr.created_at,

            c.organization_name,
            c.contact_person,
            c.email,
            c.phone

        FROM quotation_requests qr

        LEFT JOIN customers c
        ON qr.customer_id = c.id

        WHERE qr.id = ?
        `,
    [id],
  );

  return rows[0];
}

// ========================================
// UPDATE QUOTATION STATUS
// ========================================

async function updateQuotationStatus(id, status) {
  const [result] = await db.query(
    `
        UPDATE quotation_requests
        SET status = ?
        WHERE id = ?
        `,
    [status, id],
  );

  return result.affectedRows;
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  createQuotationRequest,
  getAllQuotationRequests,
  getQuotationRequestById,
  updateQuotationStatus,
};
