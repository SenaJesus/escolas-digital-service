import { UserModel, UserPhotoSchoolModel } from '../../../shared/database/models'
import type { PhotoPermissionChecker } from '../domain/ports'

export class SequelizePhotoPermissionChecker implements PhotoPermissionChecker {
  async canEdit(email: string, schoolId: number): Promise<boolean> {
    const user = await UserModel.findOne({
      where: { email },
      attributes: ['id', 'is_admin', 'can_edit_photos'],
    })
    if (!user) return false
    if (user.is_admin) return true
    if (!user.can_edit_photos) return false

    const link = await UserPhotoSchoolModel.findOne({
      where: { user_id: user.id, school_id: schoolId },
      attributes: ['id'],
    })

    return link !== null
  }
}
