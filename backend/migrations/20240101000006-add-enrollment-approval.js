'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status column to student_enrollments
    await queryInterface.addColumn('student_enrollments', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'approved',
      comment: 'Enrollment request status',
      after: 'enrolled_at'
    });

    // Add approval_date column
    await queryInterface.addColumn('student_enrollments', 'approval_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when enrollment was approved/rejected',
      after: 'status'
    });

    // Add approved_by column (teacher who approved)
    await queryInterface.addColumn('student_enrollments', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Teacher who approved/rejected the enrollment',
      after: 'approval_date'
    });

    // Add requires_approval column to classes table
    await queryInterface.addColumn('classes', 'requires_approval', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether enrollments require teacher approval',
      after: 'teacher_id'
    });

    // Add description column to classes table
    await queryInterface.addColumn('classes', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Class description',
      after: 'code'
    });

    // Add index for status
    await queryInterface.addIndex('student_enrollments', ['status'], {
      name: 'idx_enrollments_status'
    });

    // Add index for requires_approval
    await queryInterface.addIndex('classes', ['requires_approval'], {
      name: 'idx_classes_requires_approval'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('student_enrollments', 'idx_enrollments_status');
    await queryInterface.removeIndex('classes', 'idx_classes_requires_approval');

    // Remove columns from student_enrollments
    await queryInterface.removeColumn('student_enrollments', 'approved_by');
    await queryInterface.removeColumn('student_enrollments', 'approval_date');
    await queryInterface.removeColumn('student_enrollments', 'status');

    // Remove columns from classes
    await queryInterface.removeColumn('classes', 'description');
    await queryInterface.removeColumn('classes', 'requires_approval');
  }
};
