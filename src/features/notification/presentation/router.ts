import { Router, type Request, type Response, type NextFunction } from 'express'
import { badRequest } from '../../../shared/errors/AppError'
import type { AppliedChange, UpdateKind } from '../domain/models'
import { SimulateUpdateSchema } from './dto'

export interface NotificationUseCases {
  simulateUpdate(schoolId: number, kind: UpdateKind): Promise<{ change: AppliedChange; notified: string[] }>
}

export const registerNotificationRouter = (service: NotificationUseCases): Router => {
  const router = Router()

  router.post(
    '/schools/:schoolId/simulate-update',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const schoolId = Number(req.params.schoolId)
        if (!Number.isFinite(schoolId) || schoolId < 1) throw badRequest('ID da escola inválido')

        const parsed = SimulateUpdateSchema.safeParse(req.body)
        if (!parsed.success) throw badRequest('Tipo de atualização inválido (use "indicators" ou "budget").')

        const result = await service.simulateUpdate(schoolId, parsed.data.kind)

        res.status(200).json(result)
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
