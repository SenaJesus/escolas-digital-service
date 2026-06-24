'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pdde_programs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year: { type: Sequelize.INTEGER, allowNull: false },
      program: { type: Sequelize.STRING, allowNull: false },
      custeio: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
      capital: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
    })
    await queryInterface.addIndex('pdde_programs', {
      fields: ['school_id', 'year', 'program'],
      unique: true,
      name: 'unique_pdde_program',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('pdde_programs')
  },
}
