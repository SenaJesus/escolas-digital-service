'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_photo_schools', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
    await queryInterface.addIndex('user_photo_schools', {
      fields: ['user_id', 'school_id'],
      unique: true,
      name: 'unique_user_photo_school',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('user_photo_schools')
  },
}
