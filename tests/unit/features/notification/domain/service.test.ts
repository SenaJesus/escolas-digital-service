import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { AppliedChange, SchoolSnapshot } from '../../../../../src/features/notification/domain/models'
import type {
  NotificationEmailSender,
  NotificationRepository,
} from '../../../../../src/features/notification/domain/ports'
import { NotificationService } from '../../../../../src/features/notification/domain/service'

describe('NotificationService', () => {
  const snapshot: SchoolSnapshot = {
    name: 'Escola Teste',
    inep: '12345678',
    city: 'Cidade',
    uf: 'SP',
    censusYear: 2023,
    totalEnrollment: 500,
    enemYear: 2025,
    enemAverage: 520,
    idebYear: 2023,
    idebEarly: 6.1,
    pddeYear: 2024,
    pddeTotal: 15000,
  }

  const change: AppliedChange = {
    kind: 'indicators',
    field: 'IDEB Anos Iniciais 2023',
    detail: 'O IDEB subiu de 6,0 para 6,1.',
  }

  const makeRepo = (overrides: Partial<NotificationRepository> = {}): NotificationRepository => ({
    schoolExists: vi.fn().mockResolvedValue(true),
    applyChange: vi.fn().mockResolvedValue(change),
    getSnapshot: vi.fn().mockResolvedValue(snapshot),
    findSubscribers: vi.fn().mockResolvedValue([]),
    ...overrides,
  })

  const makeEmail = (): NotificationEmailSender => ({
    sendUpdateReport: vi.fn().mockResolvedValue(undefined),
  })

  it('applies the change and notifies the subscribers of that school', async () => {
    const email = makeEmail()
    const repo = makeRepo({ findSubscribers: vi.fn().mockResolvedValue(['a@x.com', 'b@x.com']) })
    const service = new NotificationService(repo, email)

    const result = await service.simulateUpdate(9, 'indicators')

    expect(repo.applyChange).toHaveBeenCalledWith(9, 'indicators')
    expect(repo.findSubscribers).toHaveBeenCalledWith(9, 'indicators')
    expect(result).toEqual({ change, notified: ['a@x.com', 'b@x.com'] })
    expect(email.sendUpdateReport).toHaveBeenCalledTimes(2)
  })

  it('still applies the change but notifies nobody when there are no subscribers', async () => {
    const email = makeEmail()
    const service = new NotificationService(makeRepo(), email)

    const result = await service.simulateUpdate(9, 'budget')

    expect(result.notified).toEqual([])
    expect(email.sendUpdateReport).not.toHaveBeenCalled()
  })

  it('throws 404 when the school does not exist', async () => {
    const service = new NotificationService(
      makeRepo({ schoolExists: vi.fn().mockResolvedValue(false) }),
      makeEmail(),
    )

    try {
      await service.simulateUpdate(9, 'indicators')
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})
