const express = require("express");
const requireAdminApiKey = require("../middleware/requireAdminApiKey");

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
router.post("/", requireAdminApiKey, addService);

// DELETE service
router.delete("/:id", requireAdminApiKey, removeService);

module.exports = router;
