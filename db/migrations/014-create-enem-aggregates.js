'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enem_aggregates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      scope: { type: Sequelize.STRING, allowNull: false },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'cities', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'states', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year: { type: Sequelize.INTEGER, allowNull: false },
      avg_cn: { type: Sequelize.DOUBLE, allowNull: true },
      avg_ch: { type: Sequelize.DOUBLE, allowNull: true },
      avg_lc: { type: Sequelize.DOUBLE, allowNull: true },
      avg_mt: { type: Sequelize.DOUBLE, allowNull: true },
      avg_essay: { type: Sequelize.DOUBLE, allowNull: true },
      avg_general: { type: Sequelize.DOUBLE, allowNull: true },
      participant_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    })
    await queryInterface.addIndex('enem_aggregates', {
      fields: ['scope', 'year', 'city_id', 'state_id'],
      name: 'idx_enem_aggregates_scope',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('enem_aggregates')
  },
}
