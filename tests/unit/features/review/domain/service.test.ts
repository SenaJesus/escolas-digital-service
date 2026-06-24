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
    findById: vi.fn().mockResolvedValue({
      id: 1,
      school_id: 1,
      email: 'u@t.com',
      rating: 8,
      comment: null,
      created_at: new Date(),
    }),
    update: vi.fn().mockImplementation((id: number, data: { rating: number; comment: string }) =>
      Promise.resolve({ id, school_id: 1, email: 'u@t.com', rating: data.rating, comment: data.comment, created_at: new Date() }),
    ),
    remove: vi.fn().mockResolvedValue(undefined),
    isAdmin: vi.fn().mockResolvedValue(false),
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

  it('updates the review when the user owns it', async () => {
    const repo = makeRepo()
    const service = new ReviewService(repo, makeEmail())

    const result = await service.update(1, 'u@t.com', { rating: 4, comment: 'updated' })

    expect(repo.update).toHaveBeenCalledWith(1, { rating: 4, comment: 'updated' })
    expect(result.rating).toBe(4)
  })

  it('throws Forbidden when updating a review owned by someone else', async () => {
    const service = new ReviewService(makeRepo(), makeEmail())

    try {
      await service.update(1, 'other@t.com', { rating: 4, comment: 'x' })
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(403)
    }
  })

  it('throws NotFound when updating a review that does not exist', async () => {
    const service = new ReviewService(makeRepo({ findById: vi.fn().mockResolvedValue(null) }), makeEmail())

    try {
      await service.update(999, 'u@t.com', { rating: 4, comment: 'x' })
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(404)
    }
  })

  it('removes the review when the user owns it', async () => {
    const repo = makeRepo()
    const service = new ReviewService(repo, makeEmail())

    await service.remove(1, 'u@t.com')

    expect(repo.remove).toHaveBeenCalledWith(1)
  })

  it('throws Forbidden when removing a review owned by someone else', async () => {
    const repo = makeRepo()
    const service = new ReviewService(repo, makeEmail())

    try {
      await service.remove(1, 'other@t.com')
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(403)
    }
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('lets an admin remove a review owned by someone else', async () => {
    const repo = makeRepo({ isAdmin: vi.fn().mockResolvedValue(true) })
    const service = new ReviewService(repo, makeEmail())

    await service.remove(1, 'admin@t.com')

    expect(repo.remove).toHaveBeenCalledWith(1)
  })
})
