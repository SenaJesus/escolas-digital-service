'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accessibilities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      handrail: { type: Sequelize.BOOLEAN, allowNull: false },
      elevator: { type: Sequelize.BOOLEAN, allowNull: false },
      tactile_flooring: { type: Sequelize.BOOLEAN, allowNull: false },
      clearance_space: { type: Sequelize.BOOLEAN, allowNull: false },
      ramps: { type: Sequelize.BOOLEAN, allowNull: false },
      audible_signal: { type: Sequelize.BOOLEAN, allowNull: false },
      tactile_signal: { type: Sequelize.BOOLEAN, allowNull: false },
      visual_signal: { type: Sequelize.BOOLEAN, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('accessibilities')
  },
}
