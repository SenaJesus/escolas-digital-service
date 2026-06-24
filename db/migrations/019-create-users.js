'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(254), allowNull: false },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      child_school_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'schools', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
    await queryInterface.addIndex('users', {
      fields: ['email'],
      unique: true,
      name: 'unique_user_email',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users')
  },
}
