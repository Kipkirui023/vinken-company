const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

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

// Database test
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      success: true,
      message: "Database connected successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/products", productRoutes);
app.use("/api/services", serviceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Vinken Solutions server running on port ${PORT}`);
});
