'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('authorizations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(254), allowNull: false },
      verification_code: { type: Sequelize.STRING(6), allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      is_valid: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    })
    await queryInterface.addIndex('authorizations', ['email'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('authorizations')
  },
}
