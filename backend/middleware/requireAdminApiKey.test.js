const assert = require("node:assert/strict");
const { test } = require("node:test");
const requireAdminApiKey = require("./requireAdminApiKey");

function invokeMiddleware(headers = {}) {
  let statusCode = 200;
  let responseBody;
  let nextCalled = false;
  const requestHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  const req = {
    get(name) {
      return requestHeaders[name.toLowerCase()];
    },
  };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  requireAdminApiKey(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, responseBody, nextCalled };
}

test("fails closed when the administrative key is not configured", (context) => {
  const originalKey = process.env.ADMIN_API_KEY;
  context.after(() => {
    if (originalKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalKey;
    }
  });
  delete process.env.ADMIN_API_KEY;

  const result = invokeMiddleware();

  assert.equal(result.statusCode, 503);
  assert.equal(result.nextCalled, false);
});

test("rejects administrative requests without a key", (context) => {
  const originalKey = process.env.ADMIN_API_KEY;
  context.after(() => {
    if (originalKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalKey;
    }
  });
  process.env.ADMIN_API_KEY = "test-administrative-key";

  const result = invokeMiddleware();

  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
});

test("accepts the configured administrative API key", (context) => {
  const originalKey = process.env.ADMIN_API_KEY;
  context.after(() => {
    if (originalKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalKey;
    }
  });
  process.env.ADMIN_API_KEY = "test-administrative-key";

  const result = invokeMiddleware({
    "x-admin-api-key": "test-administrative-key",
  });

  assert.equal(result.nextCalled, true);
  assert.equal(result.statusCode, 200);
});

test("rejects an incorrect administrative API key", (context) => {
  const originalKey = process.env.ADMIN_API_KEY;
  context.after(() => {
    if (originalKey === undefined) {
      delete process.env.ADMIN_API_KEY;
    } else {
      process.env.ADMIN_API_KEY = originalKey;
    }
  });
  process.env.ADMIN_API_KEY = "test-administrative-key";

  const result = invokeMiddleware({
    authorization: "Bearer different-key",
  });

  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
});
