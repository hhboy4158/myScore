const db = require('../utils/db');

exports.create = async (name, ownerId) => {
  const result = await db.query(
    'INSERT INTO classrooms (name, owner_id) VALUES (?, ?)',
    [name, ownerId]
  );
  return result.insertId;
};