import type { Review, SubmitInput } from './models'

export interface ReviewRepository {
  hasRecentReview(email: string, schoolId: number, since: Date): Promise<boolean>
  create(input: SubmitInput): Promise<Review>
  findSchoolName(schoolId: number): Promise<string | null>
  findById(reviewId: number): Promise<Review | null>
  update(reviewId: number, data: { rating: number; comment: string }): Promise<Review>
  remove(reviewId: number): Promise<void>
  isAdmin(email: string): Promise<boolean>
}

export interface ReviewEmailSender {
  sendReviewConfirmation(to: string, schoolName: string): Promise<void>
}
