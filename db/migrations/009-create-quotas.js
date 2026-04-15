'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      racial_ethnic_quota: { type: Sequelize.BOOLEAN, allowNull: false },
      income_quota: { type: Sequelize.BOOLEAN, allowNull: false },
      public_school_quota: { type: Sequelize.BOOLEAN, allowNull: false },
      disability_quota: { type: Sequelize.BOOLEAN, allowNull: false },
      other_quotas: { type: Sequelize.BOOLEAN, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('quotas')
  },
}
