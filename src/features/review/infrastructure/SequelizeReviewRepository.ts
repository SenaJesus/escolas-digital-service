import { Op } from 'sequelize'
import { ReviewModel, SchoolModel, UserModel } from '../../../shared/database/models'
import { notFound } from '../../../shared/errors/AppError'
import type { Review, SubmitInput } from '../domain/models'
import type { ReviewRepository } from '../domain/ports'

const toReview = (row: ReviewModel): Review => ({
  id: row.id,
  school_id: row.school_id,
  email: row.email,
  rating: row.rating,
  comment: row.comment,
  created_at: row.created_at,
})

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

  async findById(reviewId: number): Promise<Review | null> {
    const row = await ReviewModel.findByPk(reviewId)

    return row ? toReview(row) : null
  }

  async update(reviewId: number, data: { rating: number; comment: string }): Promise<Review> {
    const row = await ReviewModel.findByPk(reviewId)
    if (!row) throw notFound('Avaliação não encontrada!')

    row.rating = data.rating
    row.comment = data.comment
    await row.save()

    return toReview(row)
  }

  async remove(reviewId: number): Promise<void> {
    await ReviewModel.destroy({ where: { id: reviewId } })
  }

  async isAdmin(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ where: { email, is_admin: true }, attributes: ['id'] })

    return user !== null
  }
}
