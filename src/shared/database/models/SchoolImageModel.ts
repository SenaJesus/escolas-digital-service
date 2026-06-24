import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../sequelize'

export class SchoolImageModel extends Model<
  InferAttributes<SchoolImageModel>,
  InferCreationAttributes<SchoolImageModel>
> {
  declare id: CreationOptional<number>
  declare school_id: number
  declare object_key: string
  declare content_type: string
  declare uploaded_by: string
  declare focal_x: CreationOptional<number>
  declare focal_y: CreationOptional<number>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

SchoolImageModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    school_id: { type: DataTypes.INTEGER, allowNull: false },
    object_key: { type: DataTypes.STRING(512), allowNull: false },
    content_type: { type: DataTypes.STRING(100), allowNull: false },
    uploaded_by: { type: DataTypes.STRING(254), allowNull: false },
    focal_x: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    focal_y: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'school_images',
    modelName: 'SchoolImage',
    indexes: [{ unique: true, fields: ['school_id'], name: 'unique_school_image' }],
  },
)
