import { Op, fn, col, literal, type WhereOptions } from 'sequelize'
import {
  SchoolModel,
  CityModel,
  StateModel,
  SchoolCensusModel,
  InfrastructureModel,
  AccessibilityModel,
  InternetAccessModel,
  StaffMembersModel,
  EducationRecordModel,
  QuotasModel,
  ReviewModel,
} from '../../../shared/database/models'
import type { PaginatedResult, PaginationParams } from '../../../shared/types/Pagination'
import type { School, SchoolListItem, ListFilters } from '../domain/models'
import type { SchoolRepository } from '../domain/ports'

const CENSUS_INCLUDE = [
  {
    model: InfrastructureModel,
    as: 'infrastructure',
    include: [
      { model: AccessibilityModel, as: 'accessibility' },
      { model: InternetAccessModel, as: 'internet_access' },
      { model: StaffMembersModel, as: 'staff_members' },
    ],
  },
  {
    model: EducationRecordModel,
    as: 'education_record',
    include: [{ model: QuotasModel, as: 'quotas' }],
  },
]

const CITY_INCLUDE = {
  model: CityModel,
  as: 'city',
  include: [{ model: StateModel, as: 'state' }],
}

const rowToListItem = (row: SchoolModel): SchoolListItem => {
  const plain = row.get({ plain: true }) as Record<string, unknown>

  return {
    id: plain.id as number,
    name: plain.name as string,
    neighborhood: (plain.neighborhood as string | null) ?? null,
    city: plain.city as SchoolListItem['city'],
    average_rating: plain.average_rating as number | null,
  }
}

export class SequelizeSchoolRepository implements SchoolRepository {
  async findById(id: number): Promise<School | null> {
    const school = await SchoolModel.findByPk(id, {
      include: [
        CITY_INCLUDE,
        { model: ReviewModel, as: 'reviews' },
      ],
    })
    if (!school) return null

    const censuses = await SchoolCensusModel.findAll({
      where: { school_id: id },
      include: CENSUS_INCLUDE,
      order: [['id', 'ASC']],
    })

    const plain = school.get({ plain: true }) as Record<string, unknown>
    plain.censuses = censuses.map((c) => c.get({ plain: true }))

    return plain as unknown as School
  }

  async findWithFilters(
    filters: ListFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<SchoolListItem>> {
    const where: WhereOptions = {}

    if (filters.name)
      where.name = { [Op.iLike]: `%${filters.name}%` }

    if (filters.neighborhood)
      where.neighborhood = { [Op.iLike]: `%${filters.neighborhood}%` }

    const hasCityFilter = !!filters.city
    const hasStateFilter = !!filters.state

    const cityWhere: WhereOptions | undefined = hasCityFilter
      ? { name: { [Op.iLike]: `%${filters.city}%` } }
      : undefined

    const stateWhere: WhereOptions | undefined = hasStateFilter
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: filters.state } },
            { abbreviation: { [Op.iLike]: filters.state } },
          ],
        }
      : undefined

    const offset = (pagination.page - 1) * pagination.pageSize
    const hasAnyGeoFilter = !!(cityWhere || stateWhere)

    const buildInclude = (withAvg: boolean) => [
      {
        model: CityModel,
        as: 'city' as const,
        where: cityWhere,
        required: hasAnyGeoFilter,
        include: [
          {
            model: StateModel,
            as: 'state' as const,
            where: stateWhere,
          },
        ],
      },
      ...(withAvg
        ? [
            {
              model: ReviewModel,
              as: 'reviews' as const,
              attributes: [] as string[],
              required: false,
            },
          ]
        : []),
    ]

    const totalCount = await SchoolModel.count({
      where,
      include: buildInclude(false),
      distinct: true,
    })

    const rows = await SchoolModel.findAll({
      where,
      include: buildInclude(true),
      attributes: {
        include: [[fn('AVG', col('reviews.rating')), 'average_rating']],
      },
      group: ['School.id', 'city.id', 'city->state.id'],
      subQuery: false,
      limit: pagination.pageSize,
      offset,
      order: [['id', 'ASC']],
    })

    return {
      count: totalCount,
      next: offset + pagination.pageSize < totalCount ? 'next' : null,
      previous: pagination.page > 1 ? 'previous' : null,
      results: rows.map(rowToListItem),
    }
  }

  async findAll(pagination: PaginationParams): Promise<PaginatedResult<SchoolListItem>> {
    const offset = (pagination.page - 1) * pagination.pageSize
    const totalCount = await SchoolModel.count()

    const rows = await SchoolModel.findAll({
      include: [
        {
          model: CityModel,
          as: 'city',
          include: [{ model: StateModel, as: 'state' }],
        },
        {
          model: ReviewModel,
          as: 'reviews',
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        include: [
          [fn('AVG', col('reviews.rating')), 'average_rating'],
        ],
      },
      group: ['School.id', 'city.id', 'city->state.id'],
      subQuery: false,
      limit: pagination.pageSize,
      offset,
      order: [
        [literal('"city->state"."name"'), 'ASC'],
        ['id', 'ASC'],
      ],
    })

    return {
      count: totalCount,
      next: offset + pagination.pageSize < totalCount ? 'next' : null,
      previous: pagination.page > 1 ? 'previous' : null,
      results: rows.map(rowToListItem),
    }
  }
}
