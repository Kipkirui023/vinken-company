const express = require("express");
const requireAdminApiKey = require("../middleware/requireAdminApiKey");

const router = express.Router();

const quotationController = require("../controllers/quotationController");

// ========================================
// CREATE QUOTATION REQUEST
// ========================================

router.post("/", quotationController.createQuotationRequest);

// ========================================
// GET ALL QUOTATION REQUESTS
// ========================================

router.get("/", requireAdminApiKey, quotationController.getQuotationRequests);

// ========================================
// GET SINGLE QUOTATION REQUEST
// ========================================

router.get("/:id", requireAdminApiKey, quotationController.getQuotationRequest);

// ========================================
// UPDATE QUOTATION STATUS
// ========================================

router.put(
  "/:id/status",
  requireAdminApiKey,
  quotationController.updateQuotationStatus,
);

module.exports = router;
