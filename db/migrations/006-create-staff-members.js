'use strict'

const intCol = (Sequelize) => ({
  type: Sequelize.INTEGER,
  allowNull: false,
  defaultValue: 0,
})

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff_members', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      administrative_staff_count: intCol(Sequelize),
      general_services_count: intCol(Sequelize),
      librarian_count: intCol(Sequelize),
      health_staff_count: intCol(Sequelize),
      coordinator_count: intCol(Sequelize),
      speech_therapist_count: intCol(Sequelize),
      nutritionist_count: intCol(Sequelize),
      psychologist_count: intCol(Sequelize),
      food_service_staff_count: intCol(Sequelize),
      pedagogy_staff_count: intCol(Sequelize),
      secretary_count: intCol(Sequelize),
      security_staff_count: intCol(Sequelize),
      monitor_count: intCol(Sequelize),
      management_staff_count: intCol(Sequelize),
      social_worker_count: intCol(Sequelize),
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('staff_members')
  },
}
