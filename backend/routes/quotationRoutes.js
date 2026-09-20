const express = require("express");

const router = express.Router();

const quotationController = require("../controllers/quotationController");

// ========================================
// CREATE QUOTATION REQUEST
// ========================================

router.post("/", quotationController.createQuotationRequest);

// ========================================
// GET ALL QUOTATION REQUESTS
// ========================================

router.get("/", quotationController.getQuotationRequests);

// ========================================
// GET SINGLE QUOTATION REQUEST
// ========================================

router.get("/:id", quotationController.getQuotationRequest);

// ========================================
// UPDATE QUOTATION STATUS
// ========================================

router.put("/:id/status", quotationController.updateQuotationStatus);

module.exports = router;
