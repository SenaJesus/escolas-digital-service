import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class QuotasModel extends Model<
  InferAttributes<QuotasModel>,
  InferCreationAttributes<QuotasModel>
> {
  declare id: number
  declare racial_ethnic_quota: boolean
  declare income_quota: boolean
  declare public_school_quota: boolean
  declare disability_quota: boolean
  declare other_quotas: boolean
}

QuotasModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    racial_ethnic_quota: { type: DataTypes.BOOLEAN, allowNull: false },
    income_quota: { type: DataTypes.BOOLEAN, allowNull: false },
    public_school_quota: { type: DataTypes.BOOLEAN, allowNull: false },
    disability_quota: { type: DataTypes.BOOLEAN, allowNull: false },
    other_quotas: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  { sequelize, tableName: 'quotas', modelName: 'Quotas' },
)
