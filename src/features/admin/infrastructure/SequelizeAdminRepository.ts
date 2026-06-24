import { SchoolModel, UserModel, UserPhotoSchoolModel } from '../../../shared/database/models'
import type { AdminUserRow } from '../domain/models'
import type { AdminRepository } from '../domain/ports'

const unique = (ids: number[]): number[] => [...new Set(ids)]

export class SequelizeAdminRepository implements AdminRepository {
  async isAdmin(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ where: { email, is_admin: true }, attributes: ['id'] })

    return user !== null
  }

  async listUsers(): Promise<AdminUserRow[]> {
    const users = await UserModel.findAll({ order: [['id', 'ASC']] })
    const links = await UserPhotoSchoolModel.findAll({ attributes: ['user_id', 'school_id'], raw: true })

    const schoolsByUser = new Map<number, number[]>()
    for (const link of links) {
      const list = schoolsByUser.get(link.user_id) ?? []
      list.push(link.school_id)
      schoolsByUser.set(link.user_id, list)
    }

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      can_edit_photos: user.can_edit_photos,
      photo_school_ids: schoolsByUser.get(user.id) ?? [],
    }))
  }

  async getUser(userId: number): Promise<AdminUserRow | null> {
    const user = await UserModel.findByPk(userId)
    if (!user) return null

    const links = await UserPhotoSchoolModel.findAll({
      where: { user_id: userId },
      attributes: ['school_id'],
      raw: true,
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
      can_edit_photos: user.can_edit_photos,
      photo_school_ids: links.map((link) => link.school_id),
    }
  }

  async userExists(userId: number): Promise<boolean> {
    const user = await UserModel.findByPk(userId, { attributes: ['id'] })

    return user !== null
  }

  async schoolsExist(schoolIds: number[]): Promise<boolean> {
    const ids = unique(schoolIds)
    if (ids.length === 0) return true

    const count = await SchoolModel.count({ where: { id: ids } })

    return count === ids.length
  }

  async setPhotoPermissions(userId: number, canEditPhotos: boolean, schoolIds: number[]): Promise<void> {
    await UserModel.update(
      { can_edit_photos: canEditPhotos, updated_at: new Date() },
      { where: { id: userId } },
    )
    await UserPhotoSchoolModel.destroy({ where: { user_id: userId } })

    const ids = unique(schoolIds)
    if (ids.length === 0) return

    await UserPhotoSchoolModel.bulkCreate(ids.map((school_id) => ({ user_id: userId, school_id })))
  }
}
