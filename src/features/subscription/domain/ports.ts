import type { Subscription, SubscriptionPreferences } from './models'

export interface SubscriptionRepository {
  schoolExists(schoolId: number): Promise<boolean>
  findByEmailAndSchool(email: string, schoolId: number): Promise<Subscription | null>
  create(schoolId: number, email: string, preferences: SubscriptionPreferences): Promise<Subscription>
  update(id: number, preferences: SubscriptionPreferences): Promise<Subscription>
  remove(id: number): Promise<void>
}
