'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('states', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      abbreviation: { type: Sequelize.STRING(2), allowNull: false, unique: true },
      region: { type: Sequelize.STRING(30), allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('states')
  },
}
