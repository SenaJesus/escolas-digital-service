import { Router, type Request, type Response, type NextFunction } from 'express'
import type { School, SchoolListItem, ListFilters } from '../domain/models'
import type { PaginatedResult, PaginationParams } from '../../../shared/types/Pagination'
import { parsePagination } from '../../../shared/types/Pagination'
import { badRequest } from '../../../shared/errors/AppError'
import { toSchoolDetailDTO, toSchoolListItemDTO, toPaginatedDTO } from './dto'

export interface SchoolUseCases {
  getById(id: number): Promise<School>
  list(filters: ListFilters, pagination: PaginationParams): Promise<PaginatedResult<SchoolListItem>>
  listAll(pagination: PaginationParams): Promise<PaginatedResult<SchoolListItem>>
}

const getBaseUrl = (req: Request): string => {
  const protocol = req.protocol
  const host = req.get('host') ?? 'localhost'

  return `${protocol}://${host}${req.path}`
}

export const registerSchoolRouter = (service: SchoolUseCases): Router => {
  const router = Router()

  router.get('/schools/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>)

      const filters = {
        state: req.query.state as string | undefined,
        city: req.query.city as string | undefined,
        name: req.query.name as string | undefined,
        neighborhood: req.query.neighborhood as string | undefined,
      }

      const result = await service.list(filters, pagination)

      const dto = toPaginatedDTO(
        result,
        getBaseUrl(req),
        pagination.page,
        pagination.pageSize,
        toSchoolListItemDTO,
        filters as Record<string, string | undefined>,
      )

      res.status(200).json(dto)
    } catch (err) {
      next(err)
    }
  })

  router.get('/schools', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>)

      const result = await service.listAll(pagination)

      const dto = toPaginatedDTO(
        result,
        getBaseUrl(req),
        pagination.page,
        pagination.pageSize,
        toSchoolListItemDTO,
      )

      res.status(200).json(dto)
    } catch (err) {
      next(err)
    }
  })

  router.get('/schools/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isFinite(id) || id < 1) throw badRequest('ID inválido')

      const school = await service.getById(id)

      res.status(200).json(toSchoolDetailDTO(school))
    } catch (err) {
      next(err)
    }
  })

  return router
}
