import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { IdebReport } from '../../../../../src/features/ideb/domain/models'
import type { IdebRepository } from '../../../../../src/features/ideb/domain/ports'
import { IdebService } from '../../../../../src/features/ideb/domain/service'

describe('IdebService', () => {
  const fakeReport: IdebReport = {
    availableYears: [2023],
    evolution: [{ year: 2023, early: 6.7, late: null, highSchool: 4 }],
    data: {
      2023: {
        byLevel: [{ level: 'Fund. Iniciais', score: 6.7 }],
        vsTarget: [{ level: 'Fund. Iniciais', actual: 6.7, target: null }],
        components: [{ level: 'Fund. Iniciais', flow: 1, performance: 6.66 }],
      },
    },
  }

  const makeRepo = (report: IdebReport | null): IdebRepository => ({
    findBySchoolId: vi.fn().mockResolvedValue(report),
  })

  it('getBySchoolId returns report when found', async () => {
    const repo = makeRepo(fakeReport)
    const service = new IdebService(repo)

    const result = await service.getBySchoolId(1)

    expect(result).toEqual(fakeReport)
    expect(repo.findBySchoolId).toHaveBeenCalledWith(1)
  })

  it('getBySchoolId throws AppError 404 when school not found', async () => {
    const service = new IdebService(makeRepo(null))

    try {
      await service.getBySchoolId(999)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})
