'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('internet_access', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_internet: { type: Sequelize.BOOLEAN, allowNull: false },
      administrative_internet: { type: Sequelize.BOOLEAN, allowNull: false },
      learning_internet: { type: Sequelize.BOOLEAN, allowNull: false },
      community_internet: { type: Sequelize.BOOLEAN, allowNull: false },
      student_computer_internet: { type: Sequelize.BOOLEAN, allowNull: false },
      student_personal_device_internet: { type: Sequelize.BOOLEAN, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('internet_access')
  },
}
