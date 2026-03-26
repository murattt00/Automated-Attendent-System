const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Foreign key to users table'
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    },
    comment: 'Foreign key to classes table'
  },
  enrolled_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date when enrollment request was created'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'approved',
    comment: 'Enrollment request status'
  },
  approval_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when enrollment was approved/rejected'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Teacher who approved/rejected the enrollment'
  }
}, {
  tableName: 'student_enrollments',
  timestamps: true,
  createdAt: 'enrolled_at',
  updatedAt: 'approval_date',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'class_id'],
      name: 'unique_enrollment'
    },
    {
      fields: ['student_id'],
      name: 'idx_student_id'
    },
    {
      fields: ['class_id'],
      name: 'idx_class_id'
    },
    {
      fields: ['status'],
      name: 'idx_enrollments_status'
    }
  ]
});

module.exports = Enrollment;
