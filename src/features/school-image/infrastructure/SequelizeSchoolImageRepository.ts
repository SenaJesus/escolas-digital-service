import { SchoolImageModel, SchoolModel } from '../../../shared/database/models'
import type { SchoolImageRepository, StoredImage } from '../domain/ports'

export class SequelizeSchoolImageRepository implements SchoolImageRepository {
  async schoolExists(schoolId: number): Promise<boolean> {
    const school = await SchoolModel.findByPk(schoolId, { attributes: ['id'] })

    return school !== null
  }

  async findImage(schoolId: number): Promise<StoredImage | null> {
    const row = await SchoolImageModel.findOne({ where: { school_id: schoolId } })
    if (!row) return null

    return { objectKey: row.object_key, focalX: row.focal_x, focalY: row.focal_y }
  }

  async upsert(schoolId: number, objectKey: string, contentType: string, uploadedBy: string): Promise<void> {
    const existing = await SchoolImageModel.findOne({ where: { school_id: schoolId } })

    if (existing) {
      existing.object_key = objectKey
      existing.content_type = contentType
      existing.uploaded_by = uploadedBy
      existing.focal_x = 0
      existing.focal_y = 0
      existing.updated_at = new Date()
      await existing.save()

      return
    }

    await SchoolImageModel.create({
      school_id: schoolId,
      object_key: objectKey,
      content_type: contentType,
      uploaded_by: uploadedBy,
      focal_x: 0,
      focal_y: 0,
    })
  }

  async updatePosition(schoolId: number, focalX: number, focalY: number): Promise<void> {
    await SchoolImageModel.update(
      { focal_x: focalX, focal_y: focalY, updated_at: new Date() },
      { where: { school_id: schoolId } },
    )
  }

  async remove(schoolId: number): Promise<void> {
    await SchoolImageModel.destroy({ where: { school_id: schoolId } })
  }
}
