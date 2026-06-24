import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { EnemReport } from '../../../../../src/features/enem/domain/models'
import type { EnemRepository } from '../../../../../src/features/enem/domain/ports'
import { EnemService } from '../../../../../src/features/enem/domain/service'

describe('EnemService', () => {
  const fakeReport: EnemReport = {
    availableYears: [2024],
    yearly: [{ year: 2024, average: 520 }],
    data: {
      2024: {
        subjects: [{ subject: 'Matemática', score: 520 }],
        comparison: [{ scope: 'Escola', matematica: 520, linguagens: 510, redacao: 600 }],
        distribution: [{ range: '< 400', students: 1 }],
      },
    },
  }

  const makeRepo = (report: EnemReport | null): EnemRepository => ({
    findBySchoolId: vi.fn().mockResolvedValue(report),
  })

  it('getBySchoolId returns report when found', async () => {
    const repo = makeRepo(fakeReport)
    const service = new EnemService(repo)

    const result = await service.getBySchoolId(1)

    expect(result).toEqual(fakeReport)
    expect(repo.findBySchoolId).toHaveBeenCalledWith(1)
  })

  it('getBySchoolId throws AppError 404 when school not found', async () => {
    const service = new EnemService(makeRepo(null))

    try {
      await service.getBySchoolId(999)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})
