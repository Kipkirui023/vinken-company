const customerModel = require("../models/customerModel");
const quotationModel = require("../models/quotationModel");

// ========================================
// CREATE QUOTATION REQUEST
// ========================================

async function createQuotationRequest(req, res) {
  try {
    const {
      organization_name,
      contact_person,
      email,
      phone,
      address,

      product_service,
      quantity,
      delivery_location,
      tender_lpo_reference,
      requirement_type,
      required_delivery_date,
      additional_requirements,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!contact_person) {
      return res.status(400).json({
        success: false,
        message: "Contact person is required.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    if (!product_service) {
      return res.status(400).json({
        success: false,
        message: "Product or service required is missing.",
      });
    }

    // ========================================
    // FIND EXISTING CUSTOMER
    // ========================================

    let customer = await customerModel.getCustomerByEmail(email);

    let customerId;

    // ========================================
    // CREATE CUSTOMER IF NOT FOUND
    // ========================================

    if (!customer) {
      customerId = await customerModel.createCustomer({
        organization_name: organization_name || null,

        contact_person,

        email,

        phone: phone || null,

        address: address || null,
      });
    } else {
      customerId = customer.id;
    }

    // ========================================
    // CREATE QUOTATION REQUEST
    // ========================================

    const quotationId = await quotationModel.createQuotationRequest({
      customer_id: customerId,

      product_service,

      quantity: quantity || null,

      delivery_location: delivery_location || null,

      tender_lpo_reference: tender_lpo_reference || null,

      requirement_type: requirement_type || "Quotation",

      required_delivery_date: required_delivery_date || null,

      additional_requirements: additional_requirements || null,
    });

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message: "Your quotation request has been submitted successfully.",

      data: {
        quotation_id: quotationId,
      },
    });
  } catch (error) {
    console.error("Create quotation request error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to submit quotation request.",
    });
  }
}

// ========================================
// GET ALL QUOTATION REQUESTS
// ========================================

async function getQuotationRequests(req, res) {
  try {
    const requests = await quotationModel.getAllQuotationRequests();

    return res.json({
      success: true,

      data: requests,
    });
  } catch (error) {
    console.error("Get quotation requests error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve quotation requests.",
    });
  }
}

// ========================================
// GET SINGLE QUOTATION REQUEST
// ========================================

async function getQuotationRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await quotationModel.getQuotationRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,

        message: "Quotation request not found.",
      });
    }

    return res.json({
      success: true,

      data: request,
    });
  } catch (error) {
    console.error("Get quotation request error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve quotation request.",
    });
  }
}

// ========================================
// UPDATE QUOTATION STATUS
// ========================================

async function updateQuotationStatus(req, res) {
  try {
    const { id } = req.params;

    const { status } = req.body;

    // ========================================
    // VALID STATUSES
    // ========================================

    const validStatuses = [
      "new",
      "reviewing",
      "quoted",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid quotation status.",
      });
    }

    const affectedRows = await quotationModel.updateQuotationStatus(id, status);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,

        message: "Quotation request not found.",
      });
    }

    return res.json({
      success: true,

      message: "Quotation status updated successfully.",
    });
  } catch (error) {
    console.error("Update quotation status error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update quotation status.",
    });
  }
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  createQuotationRequest,

  getQuotationRequests,

  getQuotationRequest,

  updateQuotationStatus,
};
