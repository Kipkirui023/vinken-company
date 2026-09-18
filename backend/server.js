const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
// Home API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Vinken Solutions API is running",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Backend is healthy",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Vinken Solutions server running on port ${PORT}`);
});
