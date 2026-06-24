'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('school_images', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      object_key: { type: Sequelize.STRING(512), allowNull: false },
      content_type: { type: Sequelize.STRING(100), allowNull: false },
      uploaded_by: { type: Sequelize.STRING(254), allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
    await queryInterface.addIndex('school_images', {
      fields: ['school_id'],
      unique: true,
      name: 'unique_school_image',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('school_images')
  },
}
