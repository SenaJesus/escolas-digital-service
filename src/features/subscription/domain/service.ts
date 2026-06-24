import { conflict, notFound } from '../../../shared/errors/AppError'
import type { Subscription, SubscriptionPreferences } from './models'
import type { SubscriptionRepository } from './ports'

export class SubscriptionService {
  constructor(private readonly repo: SubscriptionRepository) {}

  get(schoolId: number, email: string): Promise<Subscription | null> {
    return this.repo.findByEmailAndSchool(email, schoolId)
  }

  async create(
    schoolId: number,
    email: string,
    preferences: SubscriptionPreferences,
  ): Promise<Subscription> {
    const schoolExists = await this.repo.schoolExists(schoolId)
    if (!schoolExists) throw notFound('Escola não encontrada!')

    const current = await this.repo.findByEmailAndSchool(email, schoolId)
    if (current) throw conflict('Você já está inscrito para receber atualizações desta escola.')

    return this.repo.create(schoolId, email, preferences)
  }

  async update(
    schoolId: number,
    email: string,
    preferences: SubscriptionPreferences,
  ): Promise<Subscription> {
    const current = await this.repo.findByEmailAndSchool(email, schoolId)
    if (!current) throw notFound('Inscrição não encontrada.')

    return this.repo.update(current.id, preferences)
  }

  async remove(schoolId: number, email: string): Promise<void> {
    const current = await this.repo.findByEmailAndSchool(email, schoolId)
    if (!current) throw notFound('Inscrição não encontrada.')

    await this.repo.remove(current.id)
  }
}
