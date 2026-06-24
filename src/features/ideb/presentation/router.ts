import { Router, type Request, type Response, type NextFunction } from 'express'
import { badRequest } from '../../../shared/errors/AppError'
import type { IdebReport } from '../domain/models'

export interface IdebUseCases {
  getBySchoolId(schoolId: number): Promise<IdebReport>
}

export const registerIdebRouter = (service: IdebUseCases): Router => {
  const router = Router()

  router.get('/schools/:id/ideb', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isFinite(id) || id < 1) throw badRequest('ID inválido')

      const report = await service.getBySchoolId(id)

      res.status(200).json(report)
    } catch (err) {
      next(err)
    }
  })

  return router
}
