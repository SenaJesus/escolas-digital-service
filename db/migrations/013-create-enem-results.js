'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enem_results', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      year: { type: Sequelize.INTEGER, allowNull: false },
      avg_cn: { type: Sequelize.DOUBLE, allowNull: true },
      avg_ch: { type: Sequelize.DOUBLE, allowNull: true },
      avg_lc: { type: Sequelize.DOUBLE, allowNull: true },
      avg_mt: { type: Sequelize.DOUBLE, allowNull: true },
      avg_essay: { type: Sequelize.DOUBLE, allowNull: true },
      avg_general: { type: Sequelize.DOUBLE, allowNull: true },
      participant_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      dist_lt_400: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      dist_400_500: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      dist_500_600: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      dist_600_700: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      dist_gt_700: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    })
    await queryInterface.addIndex('enem_results', {
      fields: ['school_id', 'year'],
      unique: true,
      name: 'unique_enem_school_year',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('enem_results')
  },
}
