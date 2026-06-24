import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export type IdebStage = 'early' | 'late' | 'high'

export class IdebScoreModel extends Model<
  InferAttributes<IdebScoreModel>,
  InferCreationAttributes<IdebScoreModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare year: number
  declare stage: IdebStage
  declare ideb: number | null
  declare learning: number | null
  declare flow: number | null
  declare target: number | null
}

IdebScoreModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    stage: { type: DataTypes.STRING, allowNull: false },
    ideb: { type: DataTypes.DOUBLE, allowNull: true },
    learning: { type: DataTypes.DOUBLE, allowNull: true },
    flow: { type: DataTypes.DOUBLE, allowNull: true },
    target: { type: DataTypes.DOUBLE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'ideb_scores',
    modelName: 'IdebScore',
    indexes: [
      { unique: true, fields: ['school_id', 'year', 'stage'], name: 'unique_ideb_school_year_stage' },
    ],
  },
)
