'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('school_censuses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year: { type: Sequelize.INTEGER, allowNull: false },
    })
    await queryInterface.addIndex('school_censuses', {
      fields: ['school_id', 'year'],
      unique: true,
      name: 'unique_school_year',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('school_censuses')
  },
}
