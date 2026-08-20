const { Sequelize } = require('sequelize');
const path = require('path');

// For local dev, if MySQL is not available, we can fallback to SQLite to ensure it runs immediately,
// but since the resume claims MySQL, we will configure it for MySQL first, and if it fails, catch it.
// Actually, let's use MySQL directly as requested.
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
