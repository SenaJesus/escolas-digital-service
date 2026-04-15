import { DataTypes, Model, type InferAttributes, type InferCreationAttributes } from 'sequelize'
import { sequelize } from '../sequelize'

export class InfrastructureModel extends Model<
  InferAttributes<InfrastructureModel>,
  InferCreationAttributes<InfrastructureModel>
> {
  declare id: number
  declare census_id: number
  declare drinking_water: boolean
  declare storage_room: boolean
  declare green_area: boolean
  declare auditorium: boolean
  declare bathroom: boolean
  declare children_bathroom: boolean
  declare accessible_bathroom: boolean
  declare staff_bathroom: boolean
  declare shower_bathroom: boolean
  declare library: boolean
  declare kitchen: boolean
  declare student_dormitory: boolean
  declare teacher_dormitory: boolean
  declare science_laboratory: boolean
  declare computer_laboratory: boolean
  declare covered_patio: boolean
  declare open_patio: boolean
  declare playground: boolean
  declare swimming_pool: boolean
  declare covered_sports_court: boolean
  declare open_sports_court: boolean
  declare arts_room: boolean
  declare music_room: boolean
  declare dance_room: boolean
  declare recreation_room: boolean
  declare principal_office: boolean
  declare reading_room: boolean
  declare teacher_room: boolean
  declare student_rest_room: boolean
  declare secretary_office: boolean
  declare special_needs_room: boolean
  declare recreational_field: boolean
  declare accessibility_id: number
  declare classroom_count: number
  declare outdoor_classroom_count: number
  declare indoor_classroom_count: number
  declare air_conditioned_classroom_count: number
  declare accessible_classroom_count: number
  declare dvd_player_count: number
  declare sound_system_count: number
  declare tv_count: number
  declare digital_whiteboard_count: number
  declare projector_count: number
  declare desktop_computer_count: number
  declare laptop_count: number
  declare tablet_count: number
  declare internet_access_id: number
  declare staff_members_id: number
  declare meal_service: boolean
  declare social_media: boolean
}

const boolCol = () => ({ type: DataTypes.BOOLEAN, allowNull: false as const })
const intCol = () => ({ type: DataTypes.INTEGER, allowNull: false as const, defaultValue: 0 })

InfrastructureModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    census_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    drinking_water: boolCol(),
    storage_room: boolCol(),
    green_area: boolCol(),
    auditorium: boolCol(),
    bathroom: boolCol(),
    children_bathroom: boolCol(),
    accessible_bathroom: boolCol(),
    staff_bathroom: boolCol(),
    shower_bathroom: boolCol(),
    library: boolCol(),
    kitchen: boolCol(),
    student_dormitory: boolCol(),
    teacher_dormitory: boolCol(),
    science_laboratory: boolCol(),
    computer_laboratory: boolCol(),
    covered_patio: boolCol(),
    open_patio: boolCol(),
    playground: boolCol(),
    swimming_pool: boolCol(),
    covered_sports_court: boolCol(),
    open_sports_court: boolCol(),
    arts_room: boolCol(),
    music_room: boolCol(),
    dance_room: boolCol(),
    recreation_room: boolCol(),
    principal_office: boolCol(),
    reading_room: boolCol(),
    teacher_room: boolCol(),
    student_rest_room: boolCol(),
    secretary_office: boolCol(),
    special_needs_room: boolCol(),
    recreational_field: boolCol(),
    accessibility_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    classroom_count: intCol(),
    outdoor_classroom_count: intCol(),
    indoor_classroom_count: intCol(),
    air_conditioned_classroom_count: intCol(),
    accessible_classroom_count: intCol(),
    dvd_player_count: intCol(),
    sound_system_count: intCol(),
    tv_count: intCol(),
    digital_whiteboard_count: intCol(),
    projector_count: intCol(),
    desktop_computer_count: intCol(),
    laptop_count: intCol(),
    tablet_count: intCol(),
    internet_access_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    staff_members_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    meal_service: boolCol(),
    social_media: boolCol(),
  },
  { sequelize, tableName: 'infrastructures', modelName: 'Infrastructure' },
)
