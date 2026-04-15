import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { AuthRepository, EmailSender, TokenIssuer } from '../../../../../src/features/auth/domain/ports'
import { AuthService } from '../../../../../src/features/auth/domain/service'

describe('AuthService', () => {
  const makeRepo = (overrides: Partial<AuthRepository> = {}): AuthRepository => ({
    upsertForEmail: vi.fn().mockResolvedValue(undefined),
    findValid: vi.fn().mockResolvedValue(null),
    invalidateForEmail: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })

  const makeEmail = (): EmailSender => ({
    sendConfirmationCode: vi.fn().mockResolvedValue(undefined),
    sendReviewConfirmation: vi.fn().mockResolvedValue(undefined),
  })

  const makeToken = (): TokenIssuer => ({
    issue: vi.fn().mockReturnValue('jwt-token'),
    verify: vi.fn().mockReturnValue({ email: 'test@test.com' }),
  })

  describe('requestAuthorization', () => {
    it('generates code, saves and sends email', async () => {
      const repo = makeRepo()
      const email = makeEmail()
      const service = new AuthService(repo, email, makeToken())

      await service.requestAuthorization('user@test.com')

      expect(repo.upsertForEmail).toHaveBeenCalledTimes(1)
      expect((repo.upsertForEmail as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toBe('user@test.com')
      expect(email.sendConfirmationCode).toHaveBeenCalledTimes(1)
    })

    it('throws BadRequest if email is empty', async () => {
      const service = new AuthService(makeRepo(), makeEmail(), makeToken())

      await expect(service.requestAuthorization('')).rejects.toThrow(AppError)
    })
  })

  describe('confirmAuthorization', () => {
    it('returns JWT when code is valid and not expired', async () => {
      const repo = makeRepo({
        findValid: vi.fn().mockResolvedValue({
          id: 1,
          email: 'u@t.com',
          verification_code: '123456',
          created_at: new Date(),
          is_valid: true,
        }),
      })
      const token = makeToken()
      const service = new AuthService(repo, makeEmail(), token)

      const jwt = await service.confirmAuthorization('u@t.com', '123456')

      expect(jwt).toBe('jwt-token')
      expect(token.issue).toHaveBeenCalledWith('u@t.com')
      expect(repo.invalidateForEmail).toHaveBeenCalledWith('u@t.com')
    })

    it('throws BadRequest if code not found', async () => {
      const service = new AuthService(makeRepo(), makeEmail(), makeToken())

      await expect(service.confirmAuthorization('u@t.com', 'wrong')).rejects.toThrow(AppError)
    })

    it('throws BadRequest if code is expired (>30min)', async () => {
      const expired = new Date(Date.now() - 31 * 60 * 1000)
      const repo = makeRepo({
        findValid: vi.fn().mockResolvedValue({
          id: 1,
          email: 'u@t.com',
          verification_code: '123456',
          created_at: expired,
          is_valid: true,
        }),
      })
      const service = new AuthService(repo, makeEmail(), makeToken())

      await expect(service.confirmAuthorization('u@t.com', '123456')).rejects.toThrow('expirado')
    })
  })
})
