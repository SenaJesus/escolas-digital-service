import type { School, SchoolListItem, ListFilters } from './models'
import type { PaginatedResult, PaginationParams } from '../../../shared/types/Pagination'

export interface SchoolRepository {
  findById(id: number): Promise<School | null>
  findWithFilters(
    filters: ListFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<SchoolListItem>>
  findAll(pagination: PaginationParams): Promise<PaginatedResult<SchoolListItem>>
}
