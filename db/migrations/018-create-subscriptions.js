'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'schools', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      email: { type: Sequelize.STRING(254), allowNull: false },
      frequency: { type: Sequelize.STRING, allowNull: false, defaultValue: 'instant' },
      notify_reviews: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_indicators: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_budget: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
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
    await queryInterface.addIndex('subscriptions', {
      fields: ['school_id', 'email'],
      unique: true,
      name: 'unique_subscription_school_email',
    })
    await queryInterface.addIndex('subscriptions', ['email'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions')
  },
}
