'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'states', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    })
    await queryInterface.addIndex('cities', ['state_id'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('cities')
  },
}
