import type { Authorization } from './models'

export interface AuthRepository {
  upsertForEmail(email: string, verificationCode: string): Promise<void>
  findValid(email: string, verificationCode: string): Promise<Authorization | null>
  invalidateForEmail(email: string): Promise<void>
}

export interface EmailSender {
  sendConfirmationCode(to: string, verificationCode: string): Promise<void>
  sendReviewConfirmation(to: string, schoolName: string): Promise<void>
}

export interface TokenIssuer {
  issue(email: string): string
  verify(token: string): { email: string } | null
}
