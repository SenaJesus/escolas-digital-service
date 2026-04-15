import { notFound } from '../../../shared/errors/AppError'
import type { PaginatedResult, PaginationParams } from '../../../shared/types/Pagination'
import type { School, SchoolListItem, ListFilters } from './models'
import type { SchoolRepository } from './ports'

export class SchoolService {
  constructor(private readonly repo: SchoolRepository) {}

  async getById(id: number): Promise<School> {
    const school = await this.repo.findById(id)
    if (!school) throw notFound('Escola não encontrada!')

    return school
  }

  list(
    filters: ListFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<SchoolListItem>> {
    return this.repo.findWithFilters(filters, pagination)
  }

  listAll(pagination: PaginationParams): Promise<PaginatedResult<SchoolListItem>> {
    return this.repo.findAll(pagination)
  }
}
