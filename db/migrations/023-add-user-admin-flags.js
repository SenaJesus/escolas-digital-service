'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('users', 'can_edit_photos', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'is_admin')
    await queryInterface.removeColumn('users', 'can_edit_photos')
  },
}
