import type { Review, SubmitInput } from './models'

export interface ReviewRepository {
  hasRecentReview(email: string, schoolId: number, since: Date): Promise<boolean>
  create(input: SubmitInput): Promise<Review>
  findSchoolName(schoolId: number): Promise<string | null>
}

export interface ReviewEmailSender {
  sendReviewConfirmation(to: string, schoolName: string): Promise<void>
}
