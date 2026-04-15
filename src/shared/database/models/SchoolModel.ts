import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class SchoolModel extends Model<
  InferAttributes<SchoolModel>,
  InferCreationAttributes<SchoolModel>
> {
  declare id: number
  declare name: string
  declare ibge_code: string
  declare dependency_type: number
  declare private_school_category: number | null
  declare location_type: number
  declare city_id: number
  declare address: string
  declare street_number: string | null
  declare address_complement: string | null
  declare neighborhood: string | null
  declare zip_code: string
  declare area_code: string | null
  declare phone_number: string | null
  declare school_year_start: Date | null
  declare school_year_end: Date | null
}

SchoolModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    ibge_code: { type: DataTypes.STRING(10), allowNull: false },
    dependency_type: { type: DataTypes.INTEGER, allowNull: false },
    private_school_category: { type: DataTypes.INTEGER, allowNull: true },
    location_type: { type: DataTypes.INTEGER, allowNull: false },
    city_id: { type: DataTypes.INTEGER, allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: false },
    street_number: { type: DataTypes.STRING(20), allowNull: true },
    address_complement: { type: DataTypes.STRING(255), allowNull: true },
    neighborhood: { type: DataTypes.STRING(100), allowNull: true },
    zip_code: { type: DataTypes.STRING(8), allowNull: false },
    area_code: { type: DataTypes.STRING(2), allowNull: true },
    phone_number: { type: DataTypes.STRING(10), allowNull: true },
    school_year_start: { type: DataTypes.DATEONLY, allowNull: true },
    school_year_end: { type: DataTypes.DATEONLY, allowNull: true },
  },
  { sequelize, tableName: 'schools', modelName: 'School' },
)
