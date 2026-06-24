import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export type EnemAggregateScope = 'city' | 'state' | 'country'

export class EnemAggregateModel extends Model<
  InferAttributes<EnemAggregateModel>,
  InferCreationAttributes<EnemAggregateModel>
> {
  declare id: CreationOptional<number>
  declare scope: EnemAggregateScope
  declare city_id: number | null
  declare state_id: number | null
  declare year: number
  declare avg_cn: number | null
  declare avg_ch: number | null
  declare avg_lc: number | null
  declare avg_mt: number | null
  declare avg_essay: number | null
  declare avg_general: number | null
  declare participant_count: CreationOptional<number>
}

EnemAggregateModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    scope: { type: DataTypes.STRING, allowNull: false },
    city_id: { type: DataTypes.INTEGER, allowNull: true },
    state_id: { type: DataTypes.INTEGER, allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: false },
    avg_cn: { type: DataTypes.DOUBLE, allowNull: true },
    avg_ch: { type: DataTypes.DOUBLE, allowNull: true },
    avg_lc: { type: DataTypes.DOUBLE, allowNull: true },
    avg_mt: { type: DataTypes.DOUBLE, allowNull: true },
    avg_essay: { type: DataTypes.DOUBLE, allowNull: true },
    avg_general: { type: DataTypes.DOUBLE, allowNull: true },
    participant_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'enem_aggregates',
    modelName: 'EnemAggregate',
    indexes: [{ fields: ['scope', 'year', 'city_id', 'state_id'], name: 'idx_enem_aggregates_scope' }],
  },
)
