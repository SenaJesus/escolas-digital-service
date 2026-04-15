import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class CityModel extends Model<
  InferAttributes<CityModel>,
  InferCreationAttributes<CityModel>
> {
  declare id: number
  declare name: string
  declare state_id: number
}

CityModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    state_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'cities', modelName: 'City' },
)
