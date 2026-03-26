'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      student_no: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
        comment: 'Student number - null for teachers'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Bcrypt hashed password'
      },
      role: {
        type: Sequelize.ENUM('teacher', 'student'),
        allowNull: false,
        defaultValue: 'student'
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

    // Add indexes for users table
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true
    });
    await queryInterface.addIndex('users', ['student_no'], {
      name: 'idx_users_student_no',
      unique: true,
      where: { student_no: { [Sequelize.Op.ne]: null } }
    });
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
