import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class InternetAccessModel extends Model<
  InferAttributes<InternetAccessModel>,
  InferCreationAttributes<InternetAccessModel>
> {
  declare id: number
  declare student_internet: boolean
  declare administrative_internet: boolean
  declare learning_internet: boolean
  declare community_internet: boolean
  declare student_computer_internet: boolean
  declare student_personal_device_internet: boolean
}

InternetAccessModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_internet: { type: DataTypes.BOOLEAN, allowNull: false },
    administrative_internet: { type: DataTypes.BOOLEAN, allowNull: false },
    learning_internet: { type: DataTypes.BOOLEAN, allowNull: false },
    community_internet: { type: DataTypes.BOOLEAN, allowNull: false },
    student_computer_internet: { type: DataTypes.BOOLEAN, allowNull: false },
    student_personal_device_internet: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  { sequelize, tableName: 'internet_access', modelName: 'InternetAccess' },
)
