'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create student_enrollments table
    await queryInterface.createTable('student_enrollments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enrolled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Enrollment date'
      },
      status: {
        type: Sequelize.ENUM('active', 'dropped', 'completed'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Enrollment status'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint for student_id + class_id
    await queryInterface.addConstraint('student_enrollments', {
      fields: ['student_id', 'class_id'],
      type: 'unique',
      name: 'unique_student_class_enrollment'
    });

    // Add indexes for student_enrollments table
    await queryInterface.addIndex('student_enrollments', ['student_id'], {
      name: 'idx_enrollments_student_id'
    });
    await queryInterface.addIndex('student_enrollments', ['class_id'], {
      name: 'idx_enrollments_class_id'
    });
    await queryInterface.addIndex('student_enrollments', ['status'], {
      name: 'idx_enrollments_status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_enrollments');
  }
};
