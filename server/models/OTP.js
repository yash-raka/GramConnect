const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ticket = require('./Ticket');

const OTP = sequelize.define('OTP', {
  code: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false }
});

Ticket.hasOne(OTP);
OTP.belongsTo(Ticket);

module.exports = OTP;
