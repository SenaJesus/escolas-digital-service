import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { ReviewRepository, ReviewEmailSender } from '../../../../../src/features/review/domain/ports'
import { ReviewService } from '../../../../../src/features/review/domain/service'

describe('ReviewService', () => {
  const makeRepo = (overrides: Partial<ReviewRepository> = {}): ReviewRepository => ({
    hasRecentReview: vi.fn().mockResolvedValue(false),
    create: vi.fn().mockResolvedValue({
      id: 1,
      school_id: 1,
      email: 'u@t.com',
      rating: 8,
      comment: null,
      created_at: new Date(),
    }),
    findSchoolName: vi.fn().mockResolvedValue('Test School'),
    ...overrides,
  })

  const makeEmail = (): ReviewEmailSender => ({
    sendReviewConfirmation: vi.fn().mockResolvedValue(undefined),
  })

  it('submits review successfully', async () => {
    const repo = makeRepo()
    const email = makeEmail()
    const service = new ReviewService(repo, email)

    await service.submit(
      { school_id: 1, email: 'u@t.com', rating: 8 },
      'u@t.com',
    )

    expect(repo.create).toHaveBeenCalledTimes(1)
    expect(email.sendReviewConfirmation).toHaveBeenCalledWith('u@t.com', 'Test School')
  })

  it('throws Forbidden if email does not match token', async () => {
    const service = new ReviewService(makeRepo(), makeEmail())

    try {
      await service.submit({ school_id: 1, email: 'a@t.com', rating: 5 }, 'b@t.com')
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(403)
    }
  })

  it('throws BadRequest if reviewed in the last 180 days', async () => {
    const repo = makeRepo({ hasRecentReview: vi.fn().mockResolvedValue(true) })
    const service = new ReviewService(repo, makeEmail())

    try {
      await service.submit({ school_id: 1, email: 'u@t.com', rating: 5 }, 'u@t.com')
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(400)
      expect((err as AppError).message).toContain('6 meses')
    }
  })

  it('throws NotFound if school does not exist', async () => {
    const repo = makeRepo({ findSchoolName: vi.fn().mockResolvedValue(null) })
    const service = new ReviewService(repo, makeEmail())

    try {
      await service.submit({ school_id: 999, email: 'u@t.com', rating: 5 }, 'u@t.com')
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})
