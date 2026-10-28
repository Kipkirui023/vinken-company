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

async function testConnection() {
  const result = await pool.query(
    `SELECT current_database() AS database, current_user AS username, NOW() AS connected_at`,
  );

  return result.rows[0];
}

async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return [result.rows, result.fields];
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
