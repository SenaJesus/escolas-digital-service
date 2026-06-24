'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('school_images', 'focal_x', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 50,
    })
    await queryInterface.addColumn('school_images', 'focal_y', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 50,
    })
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('school_images', 'focal_x')
    await queryInterface.removeColumn('school_images', 'focal_y')
  },
}
