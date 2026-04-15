import { badRequest, forbidden, notFound } from '../../../shared/errors/AppError'
import type { SubmitInput } from './models'
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
    await this.email.sendReviewConfirmation(input.email, schoolName)
  }
}
