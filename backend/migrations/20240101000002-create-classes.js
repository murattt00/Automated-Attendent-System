'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create classes table
    await queryInterface.createTable('classes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Course/Class name'
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Unique class code for enrollment'
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Teacher who created this class'
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

    // Add indexes for classes table
    await queryInterface.addIndex('classes', ['code'], {
      name: 'idx_classes_code',
      unique: true
    });
    await queryInterface.addIndex('classes', ['teacher_id'], {
      name: 'idx_classes_teacher_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('classes');
  }
};
