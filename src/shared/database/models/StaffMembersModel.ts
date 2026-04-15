import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class StaffMembersModel extends Model<
  InferAttributes<StaffMembersModel>,
  InferCreationAttributes<StaffMembersModel>
> {
  declare id: number
  declare administrative_staff_count: number
  declare general_services_count: number
  declare librarian_count: number
  declare health_staff_count: number
  declare coordinator_count: number
  declare speech_therapist_count: number
  declare nutritionist_count: number
  declare psychologist_count: number
  declare food_service_staff_count: number
  declare pedagogy_staff_count: number
  declare secretary_count: number
  declare security_staff_count: number
  declare monitor_count: number
  declare management_staff_count: number
  declare social_worker_count: number
}

const intCol = () => ({ type: DataTypes.INTEGER, allowNull: false as const, defaultValue: 0 })

StaffMembersModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    administrative_staff_count: intCol(),
    general_services_count: intCol(),
    librarian_count: intCol(),
    health_staff_count: intCol(),
    coordinator_count: intCol(),
    speech_therapist_count: intCol(),
    nutritionist_count: intCol(),
    psychologist_count: intCol(),
    food_service_staff_count: intCol(),
    pedagogy_staff_count: intCol(),
    secretary_count: intCol(),
    security_staff_count: intCol(),
    monitor_count: intCol(),
    management_staff_count: intCol(),
    social_worker_count: intCol(),
  },
  { sequelize, tableName: 'staff_members', modelName: 'StaffMembers' },
)
