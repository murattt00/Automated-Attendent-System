'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create sessions table
    await queryInterface.createTable('sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Session start time'
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Session end time, null if still active'
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Teacher latitude when session started'
      },
      long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Teacher longitude when session started'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Session active status'
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

    // Add indexes for sessions table
    await queryInterface.addIndex('sessions', ['class_id'], {
      name: 'idx_sessions_class_id'
    });
    await queryInterface.addIndex('sessions', ['is_active'], {
      name: 'idx_sessions_is_active'
    });
    await queryInterface.addIndex('sessions', ['start_time'], {
      name: 'idx_sessions_start_time'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions');
  }
};
