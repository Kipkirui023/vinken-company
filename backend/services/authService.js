const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { timingSafeEqual } = require("node:crypto");

function getJwtSecret() {
  return process.env.JWT_SECRET || "vinken-customer-secret-change-me";
}

async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required.");
  }

  const salt = await bcrypt.genSalt(10);
  return {
    hash: await bcrypt.hash(password, salt),
  };
}

async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}

function generateCustomerToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "customer",
      company: user.company || "",
    },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

async function authenticateAdmin(candidateKey) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return {
      valid: false,
      role: null,
      message: "Administrative API access is not configured.",
    };
  }

  if (!candidateKey) {
    return {
      valid: false,
      role: null,
      message: "Administrative API key is required.",
    };
  }

  const expected = Buffer.from(configuredKey);
  const actual = Buffer.from(candidateKey);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return {
      valid: false,
      role: null,
      message: "Administrative API key is invalid.",
    };
  }

  return {
    valid: true,
    role: "admin",
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateCustomerToken,
  verifyToken,
  authenticateAdmin,
};
