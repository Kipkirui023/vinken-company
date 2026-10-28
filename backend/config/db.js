const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "vinken_company",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

function normalizePlaceholders(sql, params) {
  let normalized = sql;
  let paramIndex = 0;

  normalized = normalized.replace(/\?/g, () => {
    paramIndex += 1;
    return `$${paramIndex}`;
  });

  return {
    sql: normalized,
    params,
  };
}

function ensureReturningId(sql) {
  const trimmed = sql.trim();

  if (/^INSERT\s+INTO\s+/i.test(trimmed) && !/\bRETURNING\b/i.test(trimmed)) {
    return `${trimmed} RETURNING id`;
  }

  return trimmed;
}

async function testConnection() {
  const result = await pool.query(
    `SELECT current_database() AS database, current_user AS username, NOW() AS connected_at`,
  );

  return result.rows[0];
}

async function query(sql, params = []) {
  try {
    const { sql: normalizedSql, params: normalizedParams } = normalizePlaceholders(
      ensureReturningId(sql),
      params,
    );
    const result = await pool.query(normalizedSql, normalizedParams);
    const rows = Array.isArray(result.rows) ? result.rows : [];

    const wrapped = {
      rows,
      fields: result.fields || [],
      rowCount: result.rowCount ?? rows.length,
      affectedRows: result.rowCount ?? rows.length,
      insertId:
        result.command === "INSERT" && rows.length > 0 && rows[0].id !== undefined
          ? rows[0].id
          : undefined,
    };

    return [wrapped, result.fields || []];
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
