const express = require("express");

const router = express.Router();

const {
  getServices,
  getService,
  addService,
  removeService,
} = require("../controllers/serviceController");

// GET all services
router.get("/", getServices);

// GET one service
router.get("/:id", getService);

// CREATE service
router.post("/", addService);

// DELETE service
router.delete("/:id", removeService);

module.exports = router;
