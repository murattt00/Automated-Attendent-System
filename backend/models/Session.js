const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Session end time, null if still active'
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: 'Teacher latitude when session started'
  },
  long: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    comment: 'Teacher longitude when session started'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'sessions',
  timestamps: true
});

module.exports = Session;
