import { Router, type Request, type Response, type NextFunction } from 'express'
import { badRequest } from '../../../shared/errors/AppError'
import { RequestAuthorizationSchema, ConfirmAuthorizationSchema } from './dto'

export interface AuthUseCases {
  requestAuthorization(email: string): Promise<void>
  confirmAuthorization(email: string, verificationCode: string): Promise<string>
}

export const registerAuthRouter = (service: AuthUseCases): Router => {
  const router = Router()

  router.post(
    '/request-authorization',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = RequestAuthorizationSchema.safeParse(req.body)
        if (!parsed.success) throw badRequest('Email é obrigatório.')

        await service.requestAuthorization(parsed.data.email)

        res.status(200).json({ message: 'Confirmation code sent to email.' })
      } catch (err) {
        next(err)
      }
    },
  )

  router.post(
    '/confirm-authorization',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = ConfirmAuthorizationSchema.safeParse(req.body)
        if (!parsed.success) throw badRequest('Email e código são obrigatórios.')

        const token = await service.confirmAuthorization(parsed.data.email, parsed.data.verification_code)

        res.status(200).json({ message: 'Email confirmed successfully.', token })
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
