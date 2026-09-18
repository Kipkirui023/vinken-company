const db = require("../config/db");

// Get all active services
const getAllServices = async () => {
  const [rows] = await db.query(`
        SELECT
            id,
            name,
            description,
            image,
            status,
            created_at
        FROM services
        WHERE status = 'active'
        ORDER BY created_at DESC
    `);

  return rows;
};

// Get one service
const getServiceById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT
            id,
            name,
            description,
            image,
            status,
            created_at
        FROM services
        WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Create service
const createService = async (service) => {
  const { name, description, image } = service;

  const [result] = await db.query(
    `
        INSERT INTO services
        (name, description, image)
        VALUES (?, ?, ?)
    `,
    [name, description, image],
  );

  return result.insertId;
};

// Delete service
const deleteService = async (id) => {
  const [result] = await db.query("DELETE FROM services WHERE id = ?", [id]);

  return result.affectedRows;
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  deleteService,
};
