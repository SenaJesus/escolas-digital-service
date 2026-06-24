import { Router, type Request, type Response, type NextFunction } from 'express'
import type { Review, SubmitInput } from '../domain/models'
import { badRequest, unauthorized } from '../../../shared/errors/AppError'
import type { JwtVerifier } from '../../../shared/middleware/jwtGuard'
import { makeJwtGuard } from '../../../shared/middleware/jwtGuard'
import { SubmitReviewSchema, UpdateReviewSchema } from './dto'

export interface ReviewUseCases {
  submit(input: SubmitInput, authorizedEmail: string): Promise<void>
  update(reviewId: number, authorizedEmail: string, data: { rating: number; comment: string }): Promise<Review>
  remove(reviewId: number, authorizedEmail: string): Promise<void>
}

const authorizedEmailFrom = (req: Request): string => {
  if (!req.jwtPayload) throw unauthorized('Token de autorização não fornecido.')

  return req.jwtPayload.email
}

const reviewIdFrom = (req: Request): number => {
  const reviewId = Number(req.params.reviewId)
  if (!Number.isFinite(reviewId) || reviewId < 1) throw badRequest('ID da avaliação inválido')

  return reviewId
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

  router.put('/reviews/:reviewId', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = reviewIdFrom(req)

      const parsed = UpdateReviewSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

      const review = await service.update(reviewId, authorizedEmailFrom(req), {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      })

      res.status(200).json(review)
    } catch (err) {
      next(err)
    }
  })

  router.delete('/reviews/:reviewId', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = reviewIdFrom(req)

      await service.remove(reviewId, authorizedEmailFrom(req))

      res.status(200).json({ message: 'Avaliação excluída com sucesso.' })
    } catch (err) {
      next(err)
    }
  })

  return router
}
