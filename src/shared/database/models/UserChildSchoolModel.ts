import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class UserChildSchoolModel extends Model<
  InferAttributes<UserChildSchoolModel>,
  InferCreationAttributes<UserChildSchoolModel>
> {
  declare id: CreationOptional<number>
  declare user_id: number
  declare school_id: number
  declare created_at: CreationOptional<Date>
}

UserChildSchoolModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'user_child_schools',
    modelName: 'UserChildSchool',
    timestamps: false,
    indexes: [{ unique: true, fields: ['user_id', 'school_id'], name: 'unique_user_child_school' }],
  },
)
