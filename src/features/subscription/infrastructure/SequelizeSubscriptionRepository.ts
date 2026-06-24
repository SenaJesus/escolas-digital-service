import { SchoolModel, SubscriptionModel } from '../../../shared/database/models'
import { notFound } from '../../../shared/errors/AppError'
import type { NotificationFrequency, Subscription, SubscriptionPreferences } from '../domain/models'
import type { SubscriptionRepository } from '../domain/ports'

const toSubscription = (model: SubscriptionModel): Subscription => ({
  id: model.id,
  school_id: model.school_id,
  email: model.email,
  frequency: model.frequency as NotificationFrequency,
  notify_reviews: model.notify_reviews,
  notify_indicators: model.notify_indicators,
  notify_budget: model.notify_budget,
  is_active: model.is_active,
  created_at: model.created_at,
  updated_at: model.updated_at,
})

export class SequelizeSubscriptionRepository implements SubscriptionRepository {
  async schoolExists(schoolId: number): Promise<boolean> {
    const school = await SchoolModel.findByPk(schoolId, { attributes: ['id'] })

    return school !== null
  }

  async findByEmailAndSchool(email: string, schoolId: number): Promise<Subscription | null> {
    const model = await SubscriptionModel.findOne({ where: { email, school_id: schoolId } })

    return model ? toSubscription(model) : null
  }

  async create(
    schoolId: number,
    email: string,
    preferences: SubscriptionPreferences,
  ): Promise<Subscription> {
    const model = await SubscriptionModel.create({
      school_id: schoolId,
      email,
      frequency: preferences.frequency,
      notify_reviews: preferences.notify_reviews,
      notify_indicators: preferences.notify_indicators,
      notify_budget: preferences.notify_budget,
      is_active: preferences.is_active,
    })

    return toSubscription(model)
  }

  async update(id: number, preferences: SubscriptionPreferences): Promise<Subscription> {
    await SubscriptionModel.update(
      {
        frequency: preferences.frequency,
        notify_reviews: preferences.notify_reviews,
        notify_indicators: preferences.notify_indicators,
        notify_budget: preferences.notify_budget,
        is_active: preferences.is_active,
        updated_at: new Date(),
      },
      { where: { id } },
    )

    const model = await SubscriptionModel.findByPk(id)
    if (!model) throw notFound('Inscrição não encontrada.')

    return toSubscription(model)
  }

  async remove(id: number): Promise<void> {
    await SubscriptionModel.destroy({ where: { id } })
  }
}
