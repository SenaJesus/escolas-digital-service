import { Router, type Request, type Response, type NextFunction } from 'express'
import type { Subscription, SubscriptionPreferences } from '../domain/models'
import { badRequest, unauthorized } from '../../../shared/errors/AppError'
import type { JwtVerifier } from '../../../shared/middleware/jwtGuard'
import { makeJwtGuard } from '../../../shared/middleware/jwtGuard'
import { SubscriptionPreferencesSchema, toSubscriptionDTO } from './dto'

export interface SubscriptionUseCases {
  get(schoolId: number, email: string): Promise<Subscription | null>
  create(schoolId: number, email: string, preferences: SubscriptionPreferences): Promise<Subscription>
  update(schoolId: number, email: string, preferences: SubscriptionPreferences): Promise<Subscription>
  remove(schoolId: number, email: string): Promise<void>
}

const parseSchoolId = (req: Request): number => {
  const schoolId = Number(req.params.schoolId)
  if (!Number.isFinite(schoolId) || schoolId < 1) throw badRequest('ID da escola inválido')

  return schoolId
}

const authorizedEmail = (req: Request): string => {
  if (!req.jwtPayload) throw unauthorized('Token de autorização não fornecido.')

  return req.jwtPayload.email
}

const parsePreferences = (req: Request): SubscriptionPreferences => {
  const parsed = SubscriptionPreferencesSchema.safeParse(req.body)
  if (!parsed.success) throw badRequest('Preferências de notificação inválidas.')

  return parsed.data
}

export const registerSubscriptionRouter = (
  service: SubscriptionUseCases,
  verify: JwtVerifier,
): Router => {
  const router = Router()
  const jwtGuard = makeJwtGuard(verify)

  router.get(
    '/schools/:schoolId/subscription',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const subscription = await service.get(parseSchoolId(req), authorizedEmail(req))

        res.status(200).json(subscription ? toSubscriptionDTO(subscription) : null)
      } catch (err) {
        next(err)
      }
    },
  )

  router.post(
    '/schools/:schoolId/subscription',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const subscription = await service.create(
          parseSchoolId(req),
          authorizedEmail(req),
          parsePreferences(req),
        )

        res.status(201).json(toSubscriptionDTO(subscription))
      } catch (err) {
        next(err)
      }
    },
  )

  router.put(
    '/schools/:schoolId/subscription',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const subscription = await service.update(
          parseSchoolId(req),
          authorizedEmail(req),
          parsePreferences(req),
        )

        res.status(200).json(toSubscriptionDTO(subscription))
      } catch (err) {
        next(err)
      }
    },
  )

  router.delete(
    '/schools/:schoolId/subscription',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await service.remove(parseSchoolId(req), authorizedEmail(req))

        res.status(204).send()
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
