import type { AppliedChange, SchoolSnapshot, UpdateKind } from './models'

export interface NotificationRepository {
  schoolExists(schoolId: number): Promise<boolean>
  applyChange(schoolId: number, kind: UpdateKind): Promise<AppliedChange>
  getSnapshot(schoolId: number): Promise<SchoolSnapshot | null>
  findSubscribers(schoolId: number, kind: UpdateKind): Promise<string[]>
}

export interface NotificationEmailSender {
  sendUpdateReport(to: string, subject: string, html: string): Promise<void>
}
