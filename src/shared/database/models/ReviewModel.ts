import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize'
import { sequelize } from '../sequelize'

export class ReviewModel extends Model<
  InferAttributes<ReviewModel>,
  InferCreationAttributes<ReviewModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare email: string
  declare rating: number
  declare comment: string | null
  declare created_at: CreationOptional<Date>
}

ReviewModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, tableName: 'reviews', modelName: 'Review' },
)
