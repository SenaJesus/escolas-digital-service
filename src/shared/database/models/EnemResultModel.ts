import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class EnemResultModel extends Model<
  InferAttributes<EnemResultModel>,
  InferCreationAttributes<EnemResultModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare year: number
  declare avg_cn: number | null
  declare avg_ch: number | null
  declare avg_lc: number | null
  declare avg_mt: number | null
  declare avg_essay: number | null
  declare avg_general: number | null
  declare participant_count: CreationOptional<number>
  declare dist_lt_400: CreationOptional<number>
  declare dist_400_500: CreationOptional<number>
  declare dist_500_600: CreationOptional<number>
  declare dist_600_700: CreationOptional<number>
  declare dist_gt_700: CreationOptional<number>
}

EnemResultModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    avg_cn: { type: DataTypes.DOUBLE, allowNull: true },
    avg_ch: { type: DataTypes.DOUBLE, allowNull: true },
    avg_lc: { type: DataTypes.DOUBLE, allowNull: true },
    avg_mt: { type: DataTypes.DOUBLE, allowNull: true },
    avg_essay: { type: DataTypes.DOUBLE, allowNull: true },
    avg_general: { type: DataTypes.DOUBLE, allowNull: true },
    participant_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dist_lt_400: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dist_400_500: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dist_500_600: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dist_600_700: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dist_gt_700: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'enem_results',
    modelName: 'EnemResult',
    indexes: [{ unique: true, fields: ['school_id', 'year'], name: 'unique_enem_school_year' }],
  },
)
