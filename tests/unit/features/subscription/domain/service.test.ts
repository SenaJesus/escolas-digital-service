import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type {
  Subscription,
  SubscriptionPreferences,
} from '../../../../../src/features/subscription/domain/models'
import type { SubscriptionRepository } from '../../../../../src/features/subscription/domain/ports'
import { SubscriptionService } from '../../../../../src/features/subscription/domain/service'

describe('SubscriptionService', () => {
  const preferences: SubscriptionPreferences = {
    frequency: 'instant',
    notify_reviews: true,
    notify_indicators: true,
    notify_budget: true,
    is_active: true,
  }

  const fakeSubscription: Subscription = {
    id: 1,
    school_id: 9,
    email: 'user@example.com',
    ...preferences,
    created_at: new Date(),
    updated_at: new Date(),
  }

  const makeRepo = (overrides: Partial<SubscriptionRepository> = {}): SubscriptionRepository => ({
    schoolExists: vi.fn().mockResolvedValue(true),
    findByEmailAndSchool: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(fakeSubscription),
    update: vi.fn().mockResolvedValue(fakeSubscription),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })

  const expectStatus = async (promise: Promise<unknown>, status: number): Promise<void> => {
    try {
      await promise
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(status)
    }
  }

  it('create returns the subscription when none exists yet', async () => {
    const repo = makeRepo()
    const service = new SubscriptionService(repo)

    const result = await service.create(9, 'user@example.com', preferences)

    expect(result).toEqual(fakeSubscription)
    expect(repo.create).toHaveBeenCalledWith(9, 'user@example.com', preferences)
  })

  it('create throws 409 when the user is already subscribed', async () => {
    const repo = makeRepo({ findByEmailAndSchool: vi.fn().mockResolvedValue(fakeSubscription) })
    const service = new SubscriptionService(repo)

    await expectStatus(service.create(9, 'user@example.com', preferences), 409)
  })

  it('create throws 404 when the school does not exist', async () => {
    const repo = makeRepo({ schoolExists: vi.fn().mockResolvedValue(false) })
    const service = new SubscriptionService(repo)

    await expectStatus(service.create(9, 'user@example.com', preferences), 404)
  })

  it('update delegates to the repository when the subscription exists', async () => {
    const repo = makeRepo({ findByEmailAndSchool: vi.fn().mockResolvedValue(fakeSubscription) })
    const service = new SubscriptionService(repo)

    await service.update(9, 'user@example.com', preferences)

    expect(repo.update).toHaveBeenCalledWith(fakeSubscription.id, preferences)
  })

  it('update throws 404 when the subscription is not found', async () => {
    const service = new SubscriptionService(makeRepo())

    await expectStatus(service.update(9, 'user@example.com', preferences), 404)
  })

  it('remove throws 404 when the subscription is not found', async () => {
    const service = new SubscriptionService(makeRepo())

    await expectStatus(service.remove(9, 'user@example.com'), 404)
  })
})
