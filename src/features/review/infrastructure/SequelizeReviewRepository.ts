import { Op } from 'sequelize'
import { ReviewModel, SchoolModel } from '../../../shared/database/models'
import type { Review, SubmitInput } from '../domain/models'
import type { ReviewRepository } from '../domain/ports'

export class SequelizeReviewRepository implements ReviewRepository {
  async hasRecentReview(email: string, schoolId: number, since: Date): Promise<boolean> {
    const count = await ReviewModel.count({
      where: {
        email,
        school_id: schoolId,
        created_at: { [Op.gte]: since },
      },
    })

    return count > 0
  }

  async create(input: SubmitInput): Promise<Review> {
    const row = await ReviewModel.create({
      school_id: input.school_id,
      email: input.email,
      rating: input.rating,
      comment: input.comment ?? null,
      created_at: new Date(),
    })

    return {
      id: row.id,
      school_id: row.school_id,
      email: row.email,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
    }
  }

  async findSchoolName(schoolId: number): Promise<string | null> {
    const row = await SchoolModel.findByPk(schoolId, { attributes: ['name'] })

    return row ? row.name : null
  }
}
