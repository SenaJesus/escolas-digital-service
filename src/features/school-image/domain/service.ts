import { badRequest, forbidden, notFound } from '../../../shared/errors/AppError'
import type { DecodedImage, SchoolImageView } from './models'
import type { ObjectStorage, PhotoPermissionChecker, SchoolImageRepository } from './ports'

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_BYTES = 5 * 1024 * 1024

const clampPercent = (value: number): number => Math.max(-300, Math.min(300, value))

export class SchoolImageService {
  constructor(
    private readonly repo: SchoolImageRepository,
    private readonly storage: ObjectStorage,
    private readonly permissions: PhotoPermissionChecker,
  ) {}

  async getImage(schoolId: number): Promise<SchoolImageView> {
    const image = await this.repo.findImage(schoolId)
    if (!image) return { imageUrl: null, focalX: 0, focalY: 0 }

    return { imageUrl: this.storage.publicUrl(image.objectKey), focalX: image.focalX, focalY: image.focalY }
  }

  async uploadImage(schoolId: number, dataUrl: string, uploadedBy: string): Promise<SchoolImageView> {
    await this.ensureCanEdit(uploadedBy, schoolId)

    const exists = await this.repo.schoolExists(schoolId)
    if (!exists) throw notFound('Escola não encontrada!')

    const image = this.decode(dataUrl)
    const previous = await this.repo.findImage(schoolId)
    const key = `schools/${String(schoolId)}/${String(Date.now())}.${image.extension}`

    await this.storage.put(key, image.buffer, image.contentType)
    await this.repo.upsert(schoolId, key, image.contentType, uploadedBy)

    if (previous) await this.storage.remove(previous.objectKey).catch(() => undefined)

    return { imageUrl: this.storage.publicUrl(key), focalX: 0, focalY: 0 }
  }

  async updatePosition(
    schoolId: number,
    focalX: number,
    focalY: number,
    requestedBy: string,
  ): Promise<SchoolImageView> {
    await this.ensureCanEdit(requestedBy, schoolId)

    const image = await this.repo.findImage(schoolId)
    if (!image) throw notFound('Esta escola não tem uma imagem para ajustar.')

    const x = clampPercent(focalX)
    const y = clampPercent(focalY)

    await this.repo.updatePosition(schoolId, x, y)

    return { imageUrl: this.storage.publicUrl(image.objectKey), focalX: x, focalY: y }
  }

  async deleteImage(schoolId: number, requestedBy: string): Promise<void> {
    await this.ensureCanEdit(requestedBy, schoolId)

    const image = await this.repo.findImage(schoolId)
    if (!image) return

    await this.repo.remove(schoolId)
    await this.storage.remove(image.objectKey).catch(() => undefined)
  }

  private async ensureCanEdit(email: string, schoolId: number): Promise<void> {
    const allowed = await this.permissions.canEdit(email, schoolId)
    if (!allowed) throw forbidden('Você não tem permissão para editar a foto desta escola.')
  }

  private decode(dataUrl: string): DecodedImage {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl)
    if (!match) throw badRequest('Imagem inválida. Envie um arquivo JPEG, PNG ou WEBP.')

    const contentType = match[1]
    const base64 = match[2]
    if (!contentType || !base64) throw badRequest('Imagem inválida.')

    const extension = EXTENSIONS[contentType]
    if (!extension) throw badRequest('Formato de imagem não suportado.')

    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length === 0) throw badRequest('A imagem está vazia.')
    if (buffer.length > MAX_BYTES) throw badRequest('Imagem muito grande (máximo 5 MB).')

    return { buffer, contentType, extension }
  }
}
