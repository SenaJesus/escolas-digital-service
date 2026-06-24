import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class PddeTransferModel extends Model<
  InferAttributes<PddeTransferModel>,
  InferCreationAttributes<PddeTransferModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare year: number
  declare custeio: CreationOptional<number>
  declare capital: CreationOptional<number>
  declare total: CreationOptional<number>
  declare student_count: number | null
}

PddeTransferModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    custeio: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    capital: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    student_count: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'pdde_transfers',
    modelName: 'PddeTransfer',
    indexes: [{ unique: true, fields: ['school_id', 'year'], name: 'unique_pdde_school_year' }],
  },
)
