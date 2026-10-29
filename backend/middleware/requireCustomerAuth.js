const authService = require("../services/authService");

function requireCustomerAuth(req, res, next) {
  const token =
    req.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.get("x-customer-token");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Customer session token is required.",
    });
  }

  try {
    const decoded = authService.verifyToken(token);

    if (decoded.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "This token does not belong to a customer account.",
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Your customer session is invalid or expired.",
    });
  }
}

module.exports = requireCustomerAuth;
