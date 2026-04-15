import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class EducationRecordModel extends Model<
  InferAttributes<EducationRecordModel>,
  InferCreationAttributes<EducationRecordModel>
> {
  declare id: number
  declare census_id: number
  declare indigenous_education: boolean
  declare entrance_exam: boolean | null
  declare quotas_id: number
  declare student_council: boolean
  declare distance_learning: boolean
  declare early_childhood_enrollment_count: number
  declare early_childhood_teacher_count: number
  declare nursery_enrollment_count: number
  declare nursery_teacher_count: number
  declare preschool_enrollment_count: number
  declare preschool_teacher_count: number
  declare elementary_enrollment_count: number
  declare elementary_teacher_count: number
  declare early_elementary_enrollment_count: number
  declare early_elementary_teacher_count: number
  declare late_elementary_enrollment_count: number
  declare late_elementary_teacher_count: number
  declare high_school_enrollment_count: number
  declare high_school_teacher_count: number
  declare technical_high_school_enrollment_count: number
  declare technical_high_school_teacher_count: number
  declare vocational_enrollment_count: number
  declare vocational_teacher_count: number
  declare technical_enrollment_count: number
  declare technical_teacher_count: number
  declare adult_education_enrollment_count: number
  declare adult_education_teacher_count: number
  declare adult_elementary_enrollment_count: number
  declare adult_elementary_teacher_count: number
  declare adult_early_elementary_enrollment_count: number
  declare adult_early_elementary_teacher_count: number
  declare adult_late_elementary_enrollment_count: number
  declare adult_late_elementary_teacher_count: number
  declare adult_high_school_enrollment_count: number
  declare adult_high_school_teacher_count: number
  declare special_education_enrollment_count: number
  declare special_education_teacher_count: number
}

const intCol = () => ({ type: DataTypes.INTEGER, allowNull: false as const, defaultValue: 0 })

EducationRecordModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    census_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    indigenous_education: { type: DataTypes.BOOLEAN, allowNull: false },
    entrance_exam: { type: DataTypes.BOOLEAN, allowNull: true },
    quotas_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    student_council: { type: DataTypes.BOOLEAN, allowNull: false },
    distance_learning: { type: DataTypes.BOOLEAN, allowNull: false },
    early_childhood_enrollment_count: intCol(),
    early_childhood_teacher_count: intCol(),
    nursery_enrollment_count: intCol(),
    nursery_teacher_count: intCol(),
    preschool_enrollment_count: intCol(),
    preschool_teacher_count: intCol(),
    elementary_enrollment_count: intCol(),
    elementary_teacher_count: intCol(),
    early_elementary_enrollment_count: intCol(),
    early_elementary_teacher_count: intCol(),
    late_elementary_enrollment_count: intCol(),
    late_elementary_teacher_count: intCol(),
    high_school_enrollment_count: intCol(),
    high_school_teacher_count: intCol(),
    technical_high_school_enrollment_count: intCol(),
    technical_high_school_teacher_count: intCol(),
    vocational_enrollment_count: intCol(),
    vocational_teacher_count: intCol(),
    technical_enrollment_count: intCol(),
    technical_teacher_count: intCol(),
    adult_education_enrollment_count: intCol(),
    adult_education_teacher_count: intCol(),
    adult_elementary_enrollment_count: intCol(),
    adult_elementary_teacher_count: intCol(),
    adult_early_elementary_enrollment_count: intCol(),
    adult_early_elementary_teacher_count: intCol(),
    adult_late_elementary_enrollment_count: intCol(),
    adult_late_elementary_teacher_count: intCol(),
    adult_high_school_enrollment_count: intCol(),
    adult_high_school_teacher_count: intCol(),
    special_education_enrollment_count: intCol(),
    special_education_teacher_count: intCol(),
  },
  { sequelize, tableName: 'education_records', modelName: 'EducationRecord' },
)
