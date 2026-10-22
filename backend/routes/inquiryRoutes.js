const express = require("express");
const requireAdminApiKey = require("../middleware/requireAdminApiKey");

const router = express.Router();

const {
  createInquiry,
  getInquiries,
  getInquiry,
} = require("../controllers/inquiryController");

// CREATE INQUIRY
router.post("/", createInquiry);

// GET ALL INQUIRIES
router.get("/", requireAdminApiKey, getInquiries);

// GET SINGLE INQUIRY
router.get("/:id", requireAdminApiKey, getInquiry);

module.exports = router;
