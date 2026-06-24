import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { BudgetReport } from '../../../../../src/features/pdde/domain/models'
import type { PddeRepository } from '../../../../../src/features/pdde/domain/ports'
import { BudgetService } from '../../../../../src/features/pdde/domain/service'

describe('BudgetService', () => {
  const fakeReport: BudgetReport = {
    availableYears: [2024],
    yearly: [{ year: 2024, total: 15150, custeio: 12120, capital: 3030 }],
    data: {
      2024: {
        total: 15150,
        custeio: 12120,
        capital: 3030,
        studentCount: 598,
        capitalCustom: [
          { type: 'Custeio', amount: 12120 },
          { type: 'Capital', amount: 3030 },
        ],
        programs: [{ program: 'PDDE', total: 15150 }],
      },
    },
  }

  const makeRepo = (report: BudgetReport | null): PddeRepository => ({
    findBySchoolId: vi.fn().mockResolvedValue(report),
  })

  it('getBySchoolId returns report when found', async () => {
    const repo = makeRepo(fakeReport)
    const service = new BudgetService(repo)

    const result = await service.getBySchoolId(1)

    expect(result).toEqual(fakeReport)
    expect(repo.findBySchoolId).toHaveBeenCalledWith(1)
  })

  it('getBySchoolId throws AppError 404 when school not found', async () => {
    const service = new BudgetService(makeRepo(null))

    try {
      await service.getBySchoolId(999)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})
