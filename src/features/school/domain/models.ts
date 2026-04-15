export type State = {
  id: number
  name: string
  abbreviation: string
  region: string
}

export type City = {
  id: number
  name: string
  state: State
}

export type Accessibility = {
  id: number
  handrail: boolean
  elevator: boolean
  tactile_flooring: boolean
  clearance_space: boolean
  ramps: boolean
  audible_signal: boolean
  tactile_signal: boolean
  visual_signal: boolean
}

export type InternetAccess = {
  id: number
  student_internet: boolean
  administrative_internet: boolean
  learning_internet: boolean
  community_internet: boolean
  student_computer_internet: boolean
  student_personal_device_internet: boolean
}

export type StaffMembers = {
  id: number
  administrative_staff_count: number
  general_services_count: number
  librarian_count: number
  health_staff_count: number
  coordinator_count: number
  speech_therapist_count: number
  nutritionist_count: number
  psychologist_count: number
  food_service_staff_count: number
  pedagogy_staff_count: number
  secretary_count: number
  security_staff_count: number
  monitor_count: number
  management_staff_count: number
  social_worker_count: number
}

export type Quotas = {
  id: number
  racial_ethnic_quota: boolean
  income_quota: boolean
  public_school_quota: boolean
  disability_quota: boolean
  other_quotas: boolean
}

export type Infrastructure = {
  id: number
  census_id: number
  accessibility: Accessibility
  internet_access: InternetAccess
  staff_members: StaffMembers
  drinking_water: boolean
  storage_room: boolean
  green_area: boolean
  auditorium: boolean
  bathroom: boolean
  children_bathroom: boolean
  accessible_bathroom: boolean
  staff_bathroom: boolean
  shower_bathroom: boolean
  library: boolean
  kitchen: boolean
  student_dormitory: boolean
  teacher_dormitory: boolean
  science_laboratory: boolean
  computer_laboratory: boolean
  covered_patio: boolean
  open_patio: boolean
  playground: boolean
  swimming_pool: boolean
  covered_sports_court: boolean
  open_sports_court: boolean
  arts_room: boolean
  music_room: boolean
  dance_room: boolean
  recreation_room: boolean
  principal_office: boolean
  reading_room: boolean
  teacher_room: boolean
  student_rest_room: boolean
  secretary_office: boolean
  special_needs_room: boolean
  recreational_field: boolean
  classroom_count: number
  outdoor_classroom_count: number
  indoor_classroom_count: number
  air_conditioned_classroom_count: number
  accessible_classroom_count: number
  dvd_player_count: number
  sound_system_count: number
  tv_count: number
  digital_whiteboard_count: number
  projector_count: number
  desktop_computer_count: number
  laptop_count: number
  tablet_count: number
  meal_service: boolean
  social_media: boolean
}

export type EducationRecord = {
  id: number
  census_id: number
  quotas: Quotas
  indigenous_education: boolean
  entrance_exam: boolean | null
  student_council: boolean
  distance_learning: boolean
  early_childhood_enrollment_count: number
  early_childhood_teacher_count: number
  nursery_enrollment_count: number
  nursery_teacher_count: number
  preschool_enrollment_count: number
  preschool_teacher_count: number
  elementary_enrollment_count: number
  elementary_teacher_count: number
  early_elementary_enrollment_count: number
  early_elementary_teacher_count: number
  late_elementary_enrollment_count: number
  late_elementary_teacher_count: number
  high_school_enrollment_count: number
  high_school_teacher_count: number
  technical_high_school_enrollment_count: number
  technical_high_school_teacher_count: number
  vocational_enrollment_count: number
  vocational_teacher_count: number
  technical_enrollment_count: number
  technical_teacher_count: number
  adult_education_enrollment_count: number
  adult_education_teacher_count: number
  adult_elementary_enrollment_count: number
  adult_elementary_teacher_count: number
  adult_early_elementary_enrollment_count: number
  adult_early_elementary_teacher_count: number
  adult_late_elementary_enrollment_count: number
  adult_late_elementary_teacher_count: number
  adult_high_school_enrollment_count: number
  adult_high_school_teacher_count: number
  special_education_enrollment_count: number
  special_education_teacher_count: number
}

export type SchoolCensus = {
  id: number
  school_id: number
  year: number
  infrastructure: Infrastructure
  education_record: EducationRecord
}

export type Review = {
  id: number
  email: string
  rating: number
  comment: string | null
  created_at: Date
}

export type School = {
  id: number
  name: string
  ibge_code: string
  dependency_type: number
  private_school_category: number | null
  location_type: number
  city: City
  address: string
  street_number: string | null
  address_complement: string | null
  neighborhood: string | null
  zip_code: string
  area_code: string | null
  phone_number: string | null
  school_year_start: string | null
  school_year_end: string | null
  censuses: SchoolCensus[]
  reviews: Review[]
}

export type SchoolListItem = {
  id: number
  name: string
  neighborhood: string | null
  city: City
  average_rating: number | null
}

export type ListFilters = {
  state?: string
  city?: string
  name?: string
  neighborhood?: string
}
