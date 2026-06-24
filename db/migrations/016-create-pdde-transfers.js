'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pdde_transfers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year: { type: Sequelize.INTEGER, allowNull: false },
      custeio: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
      capital: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DOUBLE, allowNull: false, defaultValue: 0 },
      student_count: { type: Sequelize.INTEGER, allowNull: true },
    })
    await queryInterface.addIndex('pdde_transfers', {
      fields: ['school_id', 'year'],
      unique: true,
      name: 'unique_pdde_school_year',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('pdde_transfers')
  },
}
