export type NotificationFrequency = 'instant' | 'weekly' | 'monthly'

export type SubscriptionPreferences = {
  frequency: NotificationFrequency
  notify_reviews: boolean
  notify_indicators: boolean
  notify_budget: boolean
  is_active: boolean
}

export type Subscription = SubscriptionPreferences & {
  id: number
  school_id: number
  email: string
  created_at: Date
  updated_at: Date
}
