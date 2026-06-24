import { z } from 'zod'
import type { Subscription } from '../domain/models'

export const SubscriptionPreferencesSchema = z.object({
  frequency: z.enum(['instant', 'weekly', 'monthly']).default('instant'),
  notify_reviews: z.boolean().default(true),
  notify_indicators: z.boolean().default(true),
  notify_budget: z.boolean().default(true),
  is_active: z.boolean().default(true),
})

export const toSubscriptionDTO = (subscription: Subscription): Record<string, unknown> => ({
  id: subscription.id,
  school_id: subscription.school_id,
  email: subscription.email,
  frequency: subscription.frequency,
  notify_reviews: subscription.notify_reviews,
  notify_indicators: subscription.notify_indicators,
  notify_budget: subscription.notify_budget,
  is_active: subscription.is_active,
  created_at: subscription.created_at,
  updated_at: subscription.updated_at,
})
