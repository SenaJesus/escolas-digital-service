import { Router, type Request, type Response, type NextFunction } from 'express'
import type { AccountSummary, ProfileInput, RegisterInput } from '../domain/models'
import { badRequest, unauthorized } from '../../../shared/errors/AppError'
import type { JwtVerifier } from '../../../shared/middleware/jwtGuard'
import { makeJwtGuard } from '../../../shared/middleware/jwtGuard'
import { DeleteAccountSchema, LoginSchema, PasswordSchema, ProfileSchema, RegisterSchema, toAccountDTO } from './dto'

export interface UserUseCases {
  register(input: RegisterInput): Promise<{ token: string; account: AccountSummary }>
  login(email: string, password: string): Promise<{ token: string; account: AccountSummary }>
  getAccount(email: string): Promise<AccountSummary>
  updateProfile(email: string, input: ProfileInput): Promise<AccountSummary>
  updatePassword(email: string, currentPassword: string, newPassword: string): Promise<void>
  deleteAccount(
    email: string,
    verificationCode: string,
    options: { deleteReviews: boolean; deleteSubscriptions: boolean },
  ): Promise<{ deleted_reviews: number; deleted_subscriptions: number }>
}

const authorizedEmail = (req: Request): string => {
  if (!req.jwtPayload) throw unauthorized('Token de autorização não fornecido.')

  return req.jwtPayload.email
}

export const registerUserRouter = (service: UserUseCases, verify: JwtVerifier): Router => {
  const router = Router()
  const jwtGuard = makeJwtGuard(verify)

  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = RegisterSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

      const result = await service.register({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        verification_code: parsed.data.verification_code,
        child_school_ids: parsed.data.child_school_ids,
      })

      res.status(201).json({ token: result.token, account: toAccountDTO(result.account) })
    } catch (err) {
      next(err)
    }
  })

  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = LoginSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest('E-mail e senha são obrigatórios.')

      const result = await service.login(parsed.data.email, parsed.data.password)

      res.status(200).json({ token: result.token, account: toAccountDTO(result.account) })
    } catch (err) {
      next(err)
    }
  })

  router.get('/account', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await service.getAccount(authorizedEmail(req))

      res.status(200).json(toAccountDTO(account))
    } catch (err) {
      next(err)
    }
  })

  router.put('/account', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ProfileSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

      const account = await service.updateProfile(authorizedEmail(req), {
        name: parsed.data.name,
        child_school_ids: parsed.data.child_school_ids,
      })

      res.status(200).json(toAccountDTO(account))
    } catch (err) {
      next(err)
    }
  })

  router.put('/account/password', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = PasswordSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

      await service.updatePassword(authorizedEmail(req), parsed.data.current_password, parsed.data.new_password)

      res.status(200).json({ message: 'Senha atualizada com sucesso.' })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/account', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = DeleteAccountSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos.')

      const result = await service.deleteAccount(authorizedEmail(req), parsed.data.verification_code, {
        deleteReviews: parsed.data.delete_reviews,
        deleteSubscriptions: parsed.data.delete_subscriptions,
      })

      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  })

  return router
}
