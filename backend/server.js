const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_DIRECTORY = path.join(__dirname, "..", "frontend");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }));
}

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/quotations", quotationRoutes);

app.use(express.static(FRONTEND_DIRECTORY));

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

async function initializeCustomerAuthSchema() {
  try {
    await db.query(
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
    );

    const [duplicateRows] = await db.query(`
      SELECT email
      FROM customers
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
      LIMIT 1
    `);

    if (duplicateRows.length === 0) {
      await db.query(
        "CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique ON customers(email)",
      );
    } else {
      console.warn(
        "Skipping unique customer email index because duplicate email values already exist.",
      );
    }
  } catch (error) {
    console.warn("Customer auth schema migration skipped:", error.message);
  }
}

initializeCustomerAuthSchema();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Vinken Solutions website and API running on port ${PORT}`);
});
