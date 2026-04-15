import type { School, SchoolListItem } from '../domain/models'
import type { PaginatedResult } from '../../../shared/types/Pagination'
import { DEFAULT_PAGE_SIZE } from '../../../shared/types/Pagination'

const toInfrastructureDTO = (infra: School['censuses'][number]['infrastructure']): Record<string, unknown> => ({
  id: infra.id,
  census: infra.census_id,
  accessibility: infra.accessibility,
  internet_access: infra.internet_access,
  staff_members: infra.staff_members,
  drinking_water: infra.drinking_water,
  storage_room: infra.storage_room,
  green_area: infra.green_area,
  auditorium: infra.auditorium,
  bathroom: infra.bathroom,
  children_bathroom: infra.children_bathroom,
  accessible_bathroom: infra.accessible_bathroom,
  staff_bathroom: infra.staff_bathroom,
  shower_bathroom: infra.shower_bathroom,
  library: infra.library,
  kitchen: infra.kitchen,
  student_dormitory: infra.student_dormitory,
  teacher_dormitory: infra.teacher_dormitory,
  science_laboratory: infra.science_laboratory,
  computer_laboratory: infra.computer_laboratory,
  covered_patio: infra.covered_patio,
  open_patio: infra.open_patio,
  playground: infra.playground,
  swimming_pool: infra.swimming_pool,
  covered_sports_court: infra.covered_sports_court,
  open_sports_court: infra.open_sports_court,
  arts_room: infra.arts_room,
  music_room: infra.music_room,
  dance_room: infra.dance_room,
  recreation_room: infra.recreation_room,
  principal_office: infra.principal_office,
  reading_room: infra.reading_room,
  teacher_room: infra.teacher_room,
  student_rest_room: infra.student_rest_room,
  secretary_office: infra.secretary_office,
  special_needs_room: infra.special_needs_room,
  recreational_field: infra.recreational_field,
  classroom_count: infra.classroom_count,
  outdoor_classroom_count: infra.outdoor_classroom_count,
  indoor_classroom_count: infra.indoor_classroom_count,
  air_conditioned_classroom_count: infra.air_conditioned_classroom_count,
  accessible_classroom_count: infra.accessible_classroom_count,
  dvd_player_count: infra.dvd_player_count,
  sound_system_count: infra.sound_system_count,
  tv_count: infra.tv_count,
  digital_whiteboard_count: infra.digital_whiteboard_count,
  projector_count: infra.projector_count,
  desktop_computer_count: infra.desktop_computer_count,
  laptop_count: infra.laptop_count,
  tablet_count: infra.tablet_count,
  meal_service: infra.meal_service,
  social_media: infra.social_media,
})

const toEducationRecordDTO = (educ: School['censuses'][number]['education_record']): Record<string, unknown> => ({
  id: educ.id,
  census: educ.census_id,
  quotas: educ.quotas,
  indigenous_education: educ.indigenous_education,
  entrance_exam: educ.entrance_exam,
  student_council: educ.student_council,
  distance_learning: educ.distance_learning,
  early_childhood_enrollment_count: educ.early_childhood_enrollment_count,
  early_childhood_teacher_count: educ.early_childhood_teacher_count,
  nursery_enrollment_count: educ.nursery_enrollment_count,
  nursery_teacher_count: educ.nursery_teacher_count,
  preschool_enrollment_count: educ.preschool_enrollment_count,
  preschool_teacher_count: educ.preschool_teacher_count,
  elementary_enrollment_count: educ.elementary_enrollment_count,
  elementary_teacher_count: educ.elementary_teacher_count,
  early_elementary_enrollment_count: educ.early_elementary_enrollment_count,
  early_elementary_teacher_count: educ.early_elementary_teacher_count,
  late_elementary_enrollment_count: educ.late_elementary_enrollment_count,
  late_elementary_teacher_count: educ.late_elementary_teacher_count,
  high_school_enrollment_count: educ.high_school_enrollment_count,
  high_school_teacher_count: educ.high_school_teacher_count,
  technical_high_school_enrollment_count: educ.technical_high_school_enrollment_count,
  technical_high_school_teacher_count: educ.technical_high_school_teacher_count,
  vocational_enrollment_count: educ.vocational_enrollment_count,
  vocational_teacher_count: educ.vocational_teacher_count,
  technical_enrollment_count: educ.technical_enrollment_count,
  technical_teacher_count: educ.technical_teacher_count,
  adult_education_enrollment_count: educ.adult_education_enrollment_count,
  adult_education_teacher_count: educ.adult_education_teacher_count,
  adult_elementary_enrollment_count: educ.adult_elementary_enrollment_count,
  adult_elementary_teacher_count: educ.adult_elementary_teacher_count,
  adult_early_elementary_enrollment_count: educ.adult_early_elementary_enrollment_count,
  adult_early_elementary_teacher_count: educ.adult_early_elementary_teacher_count,
  adult_late_elementary_enrollment_count: educ.adult_late_elementary_enrollment_count,
  adult_late_elementary_teacher_count: educ.adult_late_elementary_teacher_count,
  adult_high_school_enrollment_count: educ.adult_high_school_enrollment_count,
  adult_high_school_teacher_count: educ.adult_high_school_teacher_count,
  special_education_enrollment_count: educ.special_education_enrollment_count,
  special_education_teacher_count: educ.special_education_teacher_count,
})

export const toSchoolDetailDTO = (s: School): Record<string, unknown> => ({
  id: s.id,
  name: s.name,
  ibge_code: s.ibge_code,
  dependency_type: s.dependency_type,
  private_school_category: s.private_school_category,
  location_type: s.location_type,
  city: {
    id: s.city.id,
    name: s.city.name,
    state: {
      id: s.city.state.id,
      name: s.city.state.name,
      abbreviation: s.city.state.abbreviation,
      region: s.city.state.region,
    },
  },
  address: s.address,
  street_number: s.street_number,
  address_complement: s.address_complement,
  neighborhood: s.neighborhood,
  zip_code: s.zip_code,
  area_code: s.area_code,
  phone_number: s.phone_number,
  school_year_start: s.school_year_start,
  school_year_end: s.school_year_end,
  censuses: s.censuses.map((c) => ({
    id: c.id,
    year: c.year,
    school: c.school_id,
    infrastructure: toInfrastructureDTO(c.infrastructure),
    education_record: toEducationRecordDTO(c.education_record),
  })),
  reviews: s.reviews.map((r) => ({
    id: r.id,
    email: r.email,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
  })),
})

export const toSchoolListItemDTO = (s: SchoolListItem): Record<string, unknown> => ({
  id: s.id,
  name: s.name,
  neighborhood: s.neighborhood,
  city: {
    id: s.city.id,
    name: s.city.name,
    state: {
      id: s.city.state.id,
      name: s.city.state.name,
      abbreviation: s.city.state.abbreviation,
      region: s.city.state.region,
    },
  },
  average_rating: s.average_rating,
})

export const toPaginatedDTO = <T>(
  result: PaginatedResult<T>,
  baseUrl: string,
  page: number,
  pageSize: number,
  toDTO: (item: T) => Record<string, unknown>,
  extraParams: Record<string, string | undefined> = {},
): Record<string, unknown> => {
  const buildUrl = (p: number): string => {
    const url = new URL(baseUrl)
    url.searchParams.set('page', String(p))
    if (pageSize !== DEFAULT_PAGE_SIZE) url.searchParams.set('page_size', String(pageSize))

    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v)
    }

    return url.toString()
  }

  const totalPages = Math.ceil(result.count / pageSize)

  return {
    count: result.count,
    next: page < totalPages ? buildUrl(page + 1) : null,
    previous: page > 1 ? buildUrl(page - 1) : null,
    results: result.results.map(toDTO),
  }
}
