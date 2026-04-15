import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize'
import { sequelize } from '../sequelize'

export class AuthorizationModel extends Model<
  InferAttributes<AuthorizationModel>,
  InferCreationAttributes<AuthorizationModel>
> {
  declare id: CreationOptional<number>
  declare email: string
  declare verification_code: string
  declare created_at: CreationOptional<Date>
  declare is_valid: CreationOptional<boolean>
}

AuthorizationModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(254), allowNull: false },
    verification_code: { type: DataTypes.STRING(6), allowNull: false },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_valid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, tableName: 'authorizations', modelName: 'Authorization' },
)
