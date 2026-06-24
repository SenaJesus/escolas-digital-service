import { Router, type Request, type Response, type NextFunction } from 'express'
import { badRequest } from '../../../shared/errors/AppError'
import type { EnemReport } from '../domain/models'

export interface EnemUseCases {
  getBySchoolId(schoolId: number): Promise<EnemReport>
}

export const registerEnemRouter = (service: EnemUseCases): Router => {
  const router = Router()

  router.get('/schools/:id/enem', async (req: Request, res: Response, next: NextFunction) => {
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
