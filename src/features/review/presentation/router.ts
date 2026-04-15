import { Router, type Request, type Response, type NextFunction } from 'express'
import type { SubmitInput } from '../domain/models'
import { badRequest, unauthorized } from '../../../shared/errors/AppError'
import type { JwtVerifier } from '../../../shared/middleware/jwtGuard'
import { makeJwtGuard } from '../../../shared/middleware/jwtGuard'
import { SubmitReviewSchema } from './dto'

export interface ReviewUseCases {
  submit(input: SubmitInput, authorizedEmail: string): Promise<void>
}

export const registerReviewRouter = (service: ReviewUseCases, verify: JwtVerifier): Router => {
  const router = Router()
  const jwtGuard = makeJwtGuard(verify)

  router.post(
    '/submit-review/:schoolId',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const schoolId = Number(req.params.schoolId)
        if (!Number.isFinite(schoolId) || schoolId < 1) throw badRequest('ID da escola inválido')

        const parsed = SubmitReviewSchema.safeParse(req.body)
        if (!parsed.success) throw badRequest('Email e nota são obrigatórios.')

        const jwtPayload = req.jwtPayload
        if (!jwtPayload) throw unauthorized('Token de autorização não fornecido.')

        await service.submit(
          {
            school_id: schoolId,
            email: parsed.data.email,
            rating: parsed.data.rating,
            comment: parsed.data.comment,
          },
          jwtPayload.email,
        )

        res.status(200).json({ message: 'Review submitted successfully.' })
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
