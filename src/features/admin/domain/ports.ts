import type { AdminUserRow } from './models'

export interface AdminRepository {
  isAdmin(email: string): Promise<boolean>
  listUsers(): Promise<AdminUserRow[]>
  getUser(userId: number): Promise<AdminUserRow | null>
  userExists(userId: number): Promise<boolean>
  schoolsExist(schoolIds: number[]): Promise<boolean>
  setPhotoPermissions(userId: number, canEditPhotos: boolean, schoolIds: number[]): Promise<void>
}
