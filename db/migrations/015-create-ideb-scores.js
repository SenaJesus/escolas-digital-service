'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ideb_scores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year: { type: Sequelize.INTEGER, allowNull: false },
      stage: { type: Sequelize.STRING, allowNull: false },
      ideb: { type: Sequelize.DOUBLE, allowNull: true },
      learning: { type: Sequelize.DOUBLE, allowNull: true },
      flow: { type: Sequelize.DOUBLE, allowNull: true },
      target: { type: Sequelize.DOUBLE, allowNull: true },
    })
    await queryInterface.addIndex('ideb_scores', {
      fields: ['school_id', 'year', 'stage'],
      unique: true,
      name: 'unique_ideb_school_year_stage',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ideb_scores')
  },
}
