import { Router, type Request, type Response, type NextFunction } from 'express'
import { badRequest, unauthorized } from '../../../shared/errors/AppError'
import type { SchoolImageView } from '../domain/models'
import type { JwtVerifier } from '../../../shared/middleware/jwtGuard'
import { makeJwtGuard } from '../../../shared/middleware/jwtGuard'
import { UpdatePositionSchema, UploadImageSchema } from './dto'

export interface SchoolImageUseCases {
  getImage(schoolId: number): Promise<SchoolImageView>
  uploadImage(schoolId: number, dataUrl: string, uploadedBy: string): Promise<SchoolImageView>
  updatePosition(
    schoolId: number,
    focalX: number,
    focalY: number,
    requestedBy: string,
  ): Promise<SchoolImageView>
  deleteImage(schoolId: number, requestedBy: string): Promise<void>
}

const toDTO = (view: SchoolImageView): Record<string, unknown> => ({
  image_url: view.imageUrl,
  focal_x: view.focalX,
  focal_y: view.focalY,
})

const schoolIdFrom = (req: Request): number => {
  const schoolId = Number(req.params.schoolId)
  if (!Number.isFinite(schoolId) || schoolId < 1) throw badRequest('ID da escola inválido')

  return schoolId
}

const emailFrom = (req: Request): string => {
  if (!req.jwtPayload) throw unauthorized('Token de autorização não fornecido.')

  return req.jwtPayload.email
}

export const registerSchoolImageRouter = (service: SchoolImageUseCases, verify: JwtVerifier): Router => {
  const router = Router()
  const jwtGuard = makeJwtGuard(verify)

  router.get('/schools/:schoolId/image', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const view = await service.getImage(schoolIdFrom(req))

      res.status(200).json(toDTO(view))
    } catch (err) {
      next(err)
    }
  })

  router.post('/schools/:schoolId/image', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = UploadImageSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Imagem é obrigatória.')

      const view = await service.uploadImage(schoolIdFrom(req), parsed.data.image, emailFrom(req))

      res.status(200).json(toDTO(view))
    } catch (err) {
      next(err)
    }
  })

  router.put(
    '/schools/:schoolId/image/position',
    jwtGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = UpdatePositionSchema.safeParse(req.body)
        if (!parsed.success) throw badRequest('Posição inválida.')

        const view = await service.updatePosition(
          schoolIdFrom(req),
          parsed.data.focal_x,
          parsed.data.focal_y,
          emailFrom(req),
        )

        res.status(200).json(toDTO(view))
      } catch (err) {
        next(err)
      }
    },
  )

  router.delete('/schools/:schoolId/image', jwtGuard, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.deleteImage(schoolIdFrom(req), emailFrom(req))

      res.status(200).json({ image_url: null, focal_x: 50, focal_y: 50 })
    } catch (err) {
      next(err)
    }
  })

  return router
}
