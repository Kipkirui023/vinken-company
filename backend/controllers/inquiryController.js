const customerModel = require("../models/customerModel");
const inquiryModel = require("../models/inquiryModel");

// ========================================
// CREATE INQUIRY
// ========================================

async function createInquiry(req, res) {
  try {
    const {
      organization_name,
      contact_person,
      email,
      phone,
      address,
      subject,
      message,
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

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // ========================================
    // CHECK IF CUSTOMER ALREADY EXISTS
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
    // CREATE INQUIRY
    // ========================================

    const inquiryId = await inquiryModel.createInquiry({
      customer_id: customerId,

      subject: subject || "General Inquiry",

      message,
    });

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message: "Your inquiry has been submitted successfully.",

      data: {
        inquiry_id: inquiryId,
      },
    });
  } catch (error) {
    console.error("Create inquiry error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to submit inquiry.",
    });
  }
}

// ========================================
// GET ALL INQUIRIES
// ========================================

async function getInquiries(req, res) {
  try {
    const inquiries = await inquiryModel.getAllInquiries();

    return res.json({
      success: true,

      data: inquiries,
    });
  } catch (error) {
    console.error("Get inquiries error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve inquiries.",
    });
  }
}

// ========================================
// GET SINGLE INQUIRY
// ========================================

async function getInquiry(req, res) {
  try {
    const { id } = req.params;

    const inquiry = await inquiryModel.getInquiryById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,

        message: "Inquiry not found.",
      });
    }

    return res.json({
      success: true,

      data: inquiry,
    });
  } catch (error) {
    console.error("Get inquiry error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve inquiry.",
    });
  }
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  createInquiry,

  getInquiries,

  getInquiry,
};
