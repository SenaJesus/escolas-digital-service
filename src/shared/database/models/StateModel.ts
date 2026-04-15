import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class StateModel extends Model<
  InferAttributes<StateModel>,
  InferCreationAttributes<StateModel>
> {
  declare id: number
  declare name: string
  declare abbreviation: string
  declare region: string
}

StateModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    abbreviation: { type: DataTypes.STRING(2), allowNull: false, unique: true },
    region: { type: DataTypes.STRING(30), allowNull: false },
  },
  { sequelize, tableName: 'states', modelName: 'State' },
)
