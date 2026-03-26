const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Class/Course name'
  },
  code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Unique class code for enrollment (e.g., CS101, MATH201)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Class description'
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Teacher who owns this class'
  },
  requires_approval: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether enrollments require teacher approval'
  }
}, {
  tableName: 'classes',
  timestamps: true
});

module.exports = Class;
