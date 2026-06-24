import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class UserPhotoSchoolModel extends Model<
  InferAttributes<UserPhotoSchoolModel>,
  InferCreationAttributes<UserPhotoSchoolModel>
> {
  declare id: CreationOptional<number>
  declare user_id: number
  declare school_id: number
  declare created_at: CreationOptional<Date>
}

UserPhotoSchoolModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'user_photo_schools',
    modelName: 'UserPhotoSchool',
    timestamps: false,
    indexes: [{ unique: true, fields: ['user_id', 'school_id'], name: 'unique_user_photo_school' }],
  },
)
