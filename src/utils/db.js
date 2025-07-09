// src/utils/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connection success');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection failed：', err);
  });

module.exports = pool;
