import { badRequest, forbidden, notFound } from '../../../shared/errors/AppError'
import type { Review, SubmitInput } from './models'
import type { ReviewRepository, ReviewEmailSender } from './ports'

const REVIEW_COOLDOWN_DAYS = 180

export class ReviewService {
  constructor(
    private readonly repo: ReviewRepository,
    private readonly email: ReviewEmailSender,
  ) {}

  async submit(input: SubmitInput, authorizedEmail: string): Promise<void> {
    if (!input.email || input.rating === undefined || input.rating === null)
      throw badRequest('Email e nota são obrigatórios.')

    if (authorizedEmail !== input.email)
      throw forbidden('O token fornecido não corresponde ao email informado.')

    const since = new Date(Date.now() - REVIEW_COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
    const hasRecent = await this.repo.hasRecentReview(input.email, input.school_id, since)
    if (hasRecent) throw badRequest('Você já avaliou esta escola nos últimos 6 meses.')

    const schoolName = await this.repo.findSchoolName(input.school_id)
    if (!schoolName) throw notFound('Escola não encontrada!')

    await this.repo.create(input)

    void this.email
      .sendReviewConfirmation(input.email, schoolName)
      .catch((error: unknown) => console.error('[email] falha ao enviar confirmação de avaliação:', error))
  }

  async update(
    reviewId: number,
    authorizedEmail: string,
    data: { rating: number; comment: string },
  ): Promise<Review> {
    const review = await this.requireOwnedReview(reviewId, authorizedEmail)

    return this.repo.update(review.id, { rating: data.rating, comment: data.comment })
  }

  async remove(reviewId: number, authorizedEmail: string): Promise<void> {
    const review = await this.repo.findById(reviewId)
    if (!review) throw notFound('Avaliação não encontrada!')

    const isOwner = review.email === authorizedEmail
    const isAdmin = isOwner ? false : await this.repo.isAdmin(authorizedEmail)
    if (!isOwner && !isAdmin) throw forbidden('Você só pode excluir as suas próprias avaliações.')

    await this.repo.remove(review.id)
  }

  private async requireOwnedReview(reviewId: number, authorizedEmail: string): Promise<Review> {
    const review = await this.repo.findById(reviewId)
    if (!review) throw notFound('Avaliação não encontrada!')

    if (review.email !== authorizedEmail)
      throw forbidden('Você só pode alterar as suas próprias avaliações.')

    return review
  }
}
