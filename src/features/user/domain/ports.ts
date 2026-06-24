import type { ChildSchool, StoredUser } from './models'

export interface UserRepository {
  findByEmail(email: string): Promise<StoredUser | null>
  emailExists(email: string): Promise<boolean>
  schoolsExist(schoolIds: number[]): Promise<boolean>
  create(input: { name: string; email: string; passwordHash: string }): Promise<number>
  updateName(email: string, name: string): Promise<void>
  updatePassword(email: string, passwordHash: string): Promise<void>
  setChildSchools(userId: number, schoolIds: number[]): Promise<void>
  getChildSchools(userId: number): Promise<ChildSchool[]>
  getPhotoSchoolIds(userId: number): Promise<number[]>
  countReviews(email: string): Promise<number>
  countSubscriptions(email: string): Promise<number>
  deleteReviews(email: string): Promise<number>
  deleteSubscriptions(email: string): Promise<number>
  deleteUser(email: string): Promise<void>
}

export interface PasswordHasher {
  hash(password: string): Promise<string>
  compare(password: string, hash: string): Promise<boolean>
}

export interface AccountTokenIssuer {
  issue(email: string): string
}

export interface CodeVerifier {
  verify(email: string, code: string): Promise<void>
}
