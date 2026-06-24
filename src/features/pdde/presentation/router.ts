import { Router, type Request, type Response, type NextFunction } from 'express'
import { badRequest } from '../../../shared/errors/AppError'
import type { BudgetReport } from '../domain/models'

export interface BudgetUseCases {
  getBySchoolId(schoolId: number): Promise<BudgetReport>
}

export const registerBudgetRouter = (service: BudgetUseCases): Router => {
  const router = Router()

  router.get('/schools/:id/budget', async (req: Request, res: Response, next: NextFunction) => {
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
