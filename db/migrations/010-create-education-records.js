'use strict'

const intCol = (Sequelize) => ({ type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 })

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('education_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      census_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'school_censuses', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      indigenous_education: { type: Sequelize.BOOLEAN, allowNull: false },
      entrance_exam: { type: Sequelize.BOOLEAN, allowNull: true },
      quotas_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'quotas', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      student_council: { type: Sequelize.BOOLEAN, allowNull: false },
      distance_learning: { type: Sequelize.BOOLEAN, allowNull: false },
      early_childhood_enrollment_count: intCol(Sequelize),
      early_childhood_teacher_count: intCol(Sequelize),
      nursery_enrollment_count: intCol(Sequelize),
      nursery_teacher_count: intCol(Sequelize),
      preschool_enrollment_count: intCol(Sequelize),
      preschool_teacher_count: intCol(Sequelize),
      elementary_enrollment_count: intCol(Sequelize),
      elementary_teacher_count: intCol(Sequelize),
      early_elementary_enrollment_count: intCol(Sequelize),
      early_elementary_teacher_count: intCol(Sequelize),
      late_elementary_enrollment_count: intCol(Sequelize),
      late_elementary_teacher_count: intCol(Sequelize),
      high_school_enrollment_count: intCol(Sequelize),
      high_school_teacher_count: intCol(Sequelize),
      technical_high_school_enrollment_count: intCol(Sequelize),
      technical_high_school_teacher_count: intCol(Sequelize),
      vocational_enrollment_count: intCol(Sequelize),
      vocational_teacher_count: intCol(Sequelize),
      technical_enrollment_count: intCol(Sequelize),
      technical_teacher_count: intCol(Sequelize),
      adult_education_enrollment_count: intCol(Sequelize),
      adult_education_teacher_count: intCol(Sequelize),
      adult_elementary_enrollment_count: intCol(Sequelize),
      adult_elementary_teacher_count: intCol(Sequelize),
      adult_early_elementary_enrollment_count: intCol(Sequelize),
      adult_early_elementary_teacher_count: intCol(Sequelize),
      adult_late_elementary_enrollment_count: intCol(Sequelize),
      adult_late_elementary_teacher_count: intCol(Sequelize),
      adult_high_school_enrollment_count: intCol(Sequelize),
      adult_high_school_teacher_count: intCol(Sequelize),
      special_education_enrollment_count: intCol(Sequelize),
      special_education_teacher_count: intCol(Sequelize),
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('education_records')
  },
}
