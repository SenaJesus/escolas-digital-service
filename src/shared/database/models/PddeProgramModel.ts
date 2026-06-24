import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class PddeProgramModel extends Model<
  InferAttributes<PddeProgramModel>,
  InferCreationAttributes<PddeProgramModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare year: number
  declare program: string
  declare custeio: CreationOptional<number>
  declare capital: CreationOptional<number>
  declare total: CreationOptional<number>
}

PddeProgramModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    program: { type: DataTypes.STRING, allowNull: false },
    custeio: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    capital: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'pdde_programs',
    modelName: 'PddeProgram',
    indexes: [{ unique: true, fields: ['school_id', 'year', 'program'], name: 'unique_pdde_program' }],
  },
)
