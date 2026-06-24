'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_child_schools', {
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
    await queryInterface.addIndex('user_child_schools', {
      fields: ['user_id', 'school_id'],
      unique: true,
      name: 'unique_user_child_school',
    })

    await queryInterface.sequelize.query(
      'INSERT INTO user_child_schools (user_id, school_id, created_at) ' +
        'SELECT id, child_school_id, NOW() FROM users WHERE child_school_id IS NOT NULL',
    )

    await queryInterface.removeColumn('users', 'child_school_id')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'child_school_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'schools', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    })
    await queryInterface.dropTable('user_child_schools')
  },
}
