export type StoredImage = {
  objectKey: string
  focalX: number
  focalY: number
}

export interface SchoolImageRepository {
  schoolExists(schoolId: number): Promise<boolean>
  findImage(schoolId: number): Promise<StoredImage | null>
  upsert(schoolId: number, objectKey: string, contentType: string, uploadedBy: string): Promise<void>
  updatePosition(schoolId: number, focalX: number, focalY: number): Promise<void>
  remove(schoolId: number): Promise<void>
}

export interface ObjectStorage {
  put(key: string, body: Buffer, contentType: string): Promise<void>
  remove(key: string): Promise<void>
  publicUrl(key: string): string
}

export interface PhotoPermissionChecker {
  canEdit(email: string, schoolId: number): Promise<boolean>
}
