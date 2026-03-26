'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create attendances table
    await queryInterface.createTable('attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      type: {
        type: Sequelize.ENUM('QR', 'MANUEL'),
        allowNull: false,
        defaultValue: 'QR',
        comment: 'Attendance marking method'
      },
      device_fingerprint: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'SHA-256 hash of IP + User-Agent to prevent duplicate scans from same device'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      timestamps: true,
      updatedAt: false
    });

    // Add unique constraint for session_id + student_id
    await queryInterface.addConstraint('attendances', {
      fields: ['session_id', 'student_id'],
      type: 'unique',
      name: 'unique_attendance_per_session'
    });

    // Add indexes for attendances table
    await queryInterface.addIndex('attendances', ['session_id'], {
      name: 'idx_attendances_session_id'
    });
    await queryInterface.addIndex('attendances', ['student_id'], {
      name: 'idx_attendances_student_id'
    });
    await queryInterface.addIndex('attendances', ['device_fingerprint'], {
      name: 'idx_attendances_device_fingerprint'
    });
    await queryInterface.addIndex('attendances', ['type'], {
      name: 'idx_attendances_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendances');
  }
};
