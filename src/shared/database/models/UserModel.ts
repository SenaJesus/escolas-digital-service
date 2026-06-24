import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare email: string
  declare password_hash: string
  declare is_admin: CreationOptional<boolean>
  declare can_edit_photos: CreationOptional<boolean>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

UserModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    is_admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    can_edit_photos: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    indexes: [{ unique: true, fields: ['email'], name: 'unique_user_email' }],
  },
)
