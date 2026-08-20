const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ticket = require('./Ticket');

const VoiceNote = sequelize.define('VoiceNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  filePath: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: true }
});

// Associations
Ticket.hasOne(VoiceNote);
VoiceNote.belongsTo(Ticket);

module.exports = VoiceNote;
