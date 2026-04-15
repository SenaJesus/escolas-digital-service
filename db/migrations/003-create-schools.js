'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schools', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      ibge_code: { type: Sequelize.STRING(10), allowNull: false },
      dependency_type: { type: Sequelize.INTEGER, allowNull: false },
      private_school_category: { type: Sequelize.INTEGER, allowNull: true },
      location_type: { type: Sequelize.INTEGER, allowNull: false },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cities', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      address: { type: Sequelize.STRING(255), allowNull: false },
      street_number: { type: Sequelize.STRING(20), allowNull: true },
      address_complement: { type: Sequelize.STRING(255), allowNull: true },
      neighborhood: { type: Sequelize.STRING(100), allowNull: true },
      zip_code: { type: Sequelize.STRING(8), allowNull: false },
      area_code: { type: Sequelize.STRING(2), allowNull: true },
      phone_number: { type: Sequelize.STRING(10), allowNull: true },
      school_year_start: { type: Sequelize.DATEONLY, allowNull: true },
      school_year_end: { type: Sequelize.DATEONLY, allowNull: true },
    })
    await queryInterface.addIndex('schools', ['city_id'])
    await queryInterface.addIndex('schools', ['name'])
    await queryInterface.addIndex('schools', ['neighborhood'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('schools')
  },
}
