const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sessions',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('QR', 'MANUEL'),
    allowNull: false,
    defaultValue: 'QR'
  },
  device_fingerprint: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hash of IP + User-Agent to prevent duplicate scans from same device'
  }
}, {
  tableName: 'attendances',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['session_id', 'student_id'],
      name: 'unique_attendance_per_session'
    }
  ]
});

module.exports = Attendance;
