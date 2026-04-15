import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class SchoolCensusModel extends Model<
  InferAttributes<SchoolCensusModel>,
  InferCreationAttributes<SchoolCensusModel>
> {
  declare id: number
  declare school_id: number
  declare year: number
}

SchoolCensusModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'school_censuses',
    modelName: 'SchoolCensus',
    indexes: [{ unique: true, fields: ['school_id', 'year'], name: 'unique_school_year' }],
  },
)
