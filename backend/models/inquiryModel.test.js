const assert = require("node:assert/strict");
const { test } = require("node:test");

const db = require("../config/db");
const inquiryModel = require("./inquiryModel");

const originalQuery = db.query;

function withLegacyInquirySchema(testFn) {
  return async () => {
    const queryHistory = [];

    db.query = async (sql, params = []) => {
      queryHistory.push({ sql, params });

      if (sql.includes("information_schema.columns")) {
        return [[
          { column_name: "id" },
          { column_name: "name" },
          { column_name: "email" },
          { column_name: "phone" },
          { column_name: "subject" },
          { column_name: "message" },
          { column_name: "status" },
          { column_name: "created_at" },
        ]];
      }

      if (sql.includes("INSERT INTO inquiries")) {
        return [{ insertId: 42, affectedRows: 1, rowCount: 1 }, []];
      }

      if (sql.includes("FROM inquiries")) {
        return [[{
          id: 42,
          contact_person: "Legacy User",
          email: "legacy@example.com",
          phone: "0712345678",
          subject: "General",
          message: "Legacy message",
          status: "new",
          organization_name: null,
          created_at: "2024-01-01T00:00:00.000Z",
        }], []];
      }

      throw new Error(`Unexpected query: ${sql}`);
    };

    try {
      await testFn(queryHistory);
    } finally {
      db.query = originalQuery;
    }
  };
}

test("legacy inquiry schema inserts without customer_id", withLegacyInquirySchema(async (queryHistory) => {
  const inquiryId = await inquiryModel.createInquiry({
    customer_id: null,
    contact_person: "Legacy User",
    email: "legacy@example.com",
    phone: "0712345678",
    subject: "General",
    message: "Legacy message",
  });

  assert.equal(inquiryId, 42);

  const insertCall = queryHistory.find((entry) =>
    entry.sql.includes("INSERT INTO inquiries")
  );
  assert.ok(insertCall);
  assert.deepEqual(insertCall.params, [
    "Legacy User",
    "legacy@example.com",
    "0712345678",
    "General",
    "Legacy message",
  ]);
}));

test("legacy inquiry schema reads rows without customer joins", withLegacyInquirySchema(async () => {
  const rows = await inquiryModel.getAllInquiries();

  assert.equal(rows.length, 1);
  assert.equal(rows[0].contact_person, "Legacy User");
  assert.equal(rows[0].organization_name, null);
}));
