const assert = require("node:assert/strict");
const { test } = require("node:test");

const authService = require("./authService");

test("customer account login verifies the stored password hash", async () => {
  const account = await authService.hashPassword("StrongPass123!");

  assert.match(account.hash, /^\$2[aby]\$/);

  const valid = await authService.comparePassword(
    "StrongPass123!",
    account.hash,
  );
  const invalid = await authService.comparePassword(
    "WrongPass!",
    account.hash,
  );

  assert.equal(valid, true);
  assert.equal(invalid, false);
});

test("admin login accepts the configured environment key", async () => {
  const original = process.env.ADMIN_API_KEY;
  process.env.ADMIN_API_KEY = "admin-secret";

  try {
    const result = await authService.authenticateAdmin("admin-secret");
    assert.equal(result.valid, true);
    assert.equal(result.role, "admin");
  } finally {
    if (original === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = original;
  }
});
