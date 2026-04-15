import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class AccessibilityModel extends Model<
  InferAttributes<AccessibilityModel>,
  InferCreationAttributes<AccessibilityModel>
> {
  declare id: number
  declare handrail: boolean
  declare elevator: boolean
  declare tactile_flooring: boolean
  declare clearance_space: boolean
  declare ramps: boolean
  declare audible_signal: boolean
  declare tactile_signal: boolean
  declare visual_signal: boolean
}

AccessibilityModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    handrail: { type: DataTypes.BOOLEAN, allowNull: false },
    elevator: { type: DataTypes.BOOLEAN, allowNull: false },
    tactile_flooring: { type: DataTypes.BOOLEAN, allowNull: false },
    clearance_space: { type: DataTypes.BOOLEAN, allowNull: false },
    ramps: { type: DataTypes.BOOLEAN, allowNull: false },
    audible_signal: { type: DataTypes.BOOLEAN, allowNull: false },
    tactile_signal: { type: DataTypes.BOOLEAN, allowNull: false },
    visual_signal: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  { sequelize, tableName: 'accessibilities', modelName: 'Accessibility' },
)
