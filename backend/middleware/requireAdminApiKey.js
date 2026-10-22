const { timingSafeEqual } = require("node:crypto");

function requireAdminApiKey(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const providedKey =
    req.get("x-admin-api-key") ||
    req.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!configuredKey) {
    return res.status(503).json({
      success: false,
      message: "Administrative API access is not configured.",
    });
  }

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      message: "Administrative API key is required.",
    });
  }

  const expected = Buffer.from(configuredKey);
  const actual = Buffer.from(providedKey);
  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return res.status(401).json({
      success: false,
      message: "Administrative API key is invalid.",
    });
  }

  next();
}

module.exports = requireAdminApiKey;
