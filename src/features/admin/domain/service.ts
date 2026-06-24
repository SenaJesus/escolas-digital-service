import { badRequest, forbidden, notFound } from '../../../shared/errors/AppError'
import type { AdminUserRow } from './models'
import type { AdminRepository } from './ports'

export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  async listUsers(requesterEmail: string): Promise<AdminUserRow[]> {
    await this.requireAdmin(requesterEmail)

    return this.repo.listUsers()
  }

  async updatePhotoPermissions(
    requesterEmail: string,
    userId: number,
    canEditPhotos: boolean,
    schoolIds: number[],
  ): Promise<AdminUserRow> {
    await this.requireAdmin(requesterEmail)

    const exists = await this.repo.userExists(userId)
    if (!exists) throw notFound('Usuário não encontrado.')

    const schoolsOk = await this.repo.schoolsExist(schoolIds)
    if (!schoolsOk) throw badRequest('Uma das escolas informadas não existe.')

    await this.repo.setPhotoPermissions(userId, canEditPhotos, canEditPhotos ? schoolIds : [])

    const user = await this.repo.getUser(userId)
    if (!user) throw notFound('Usuário não encontrado.')

    return user
  }

  private async requireAdmin(email: string): Promise<void> {
    const admin = await this.repo.isAdmin(email)
    if (!admin) throw forbidden('Acesso restrito a administradores.')
  }
}
