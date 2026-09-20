const express = require("express");

const router = express.Router();

const {
  createInquiry,
  getInquiries,
  getInquiry,
} = require("../controllers/inquiryController");

// CREATE INQUIRY
router.post("/", createInquiry);

// GET ALL INQUIRIES
router.get("/", getInquiries);

// GET SINGLE INQUIRY
router.get("/:id", getInquiry);

module.exports = router;
