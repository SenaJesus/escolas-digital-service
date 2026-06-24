import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class SubscriptionModel extends Model<
  InferAttributes<SubscriptionModel>,
  InferCreationAttributes<SubscriptionModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare email: string
  declare frequency: string
  declare notify_reviews: CreationOptional<boolean>
  declare notify_indicators: CreationOptional<boolean>
  declare notify_budget: CreationOptional<boolean>
  declare is_active: CreationOptional<boolean>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

SubscriptionModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false },
    frequency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'instant' },
    notify_reviews: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    notify_indicators: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    notify_budget: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    modelName: 'Subscription',
    indexes: [
      { unique: true, fields: ['school_id', 'email'], name: 'unique_subscription_school_email' },
    ],
  },
)
