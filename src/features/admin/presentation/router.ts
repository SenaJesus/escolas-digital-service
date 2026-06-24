import { Router, type Request, type Response, type NextFunction } from 'express'
import type { AdminUserRow } from '../domain/models'
import { badRequest, unauthorized } from '../../../shared/errors/AppError'
import type { JwtVerifier } from '../../../shared/middleware/jwtGuard'
import { makeJwtGuard } from '../../../shared/middleware/jwtGuard'
import { UpdatePhotoPermissionsSchema } from './dto'

export interface AdminUseCases {
  listUsers(requesterEmail: string): Promise<AdminUserRow[]>
  updatePhotoPermissions(
    requesterEmail: string,
    userId: number,
    canEditPhotos: boolean,
    schoolIds: number[],
  ): Promise<AdminUserRow>
}

const emailFrom = (req: Request): string => {
  if (!req.jwtPayload) throw unauthorized('Token de autorização não fornecido.')

  return req.jwtPayload.email
}

const userIdFrom = (req: Request): number => {
  const userId = Number(req.params.userId)
  if (!Number.isFinite(userId) || userId < 1) throw badRequest('ID do usuário inválido')

  return userId
}

export const registerAdminRouter = (service: AdminUseCases, verify: JwtVerifier): Router => {
  const router = Router()
  const jwtGuard = makeJwtGuard(verify)

  router.get('/admin/users', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await service.listUsers(emailFrom(req))

      res.status(200).json({ users })
    } catch (err) {
      next(err)
    }
  })

  router.put(
    '/admin/users/:userId/photo-permissions',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = UpdatePhotoPermissionsSchema.safeParse(req.body)
        if (!parsed.success) throw badRequest('Dados inválidos.')

        const user = await service.updatePhotoPermissions(
          emailFrom(req),
          userIdFrom(req),
          parsed.data.can_edit_photos,
          parsed.data.school_ids,
        )

        res.status(200).json(user)
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
