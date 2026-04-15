import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type { SchoolRepository } from '../../../../../src/features/school/domain/ports'
import { SchoolService } from '../../../../../src/features/school/domain/service'
import type { School } from '../../../../../src/features/school/domain/models'

describe('SchoolService', () => {
  const fakeSchool: School = {
    id: 1,
    name: 'Test School',
    ibge_code: '12345678',
    dependency_type: 2,
    private_school_category: null,
    location_type: 1,
    city: { id: 1, name: 'City', state: { id: 1, name: 'State', abbreviation: 'XX', region: 'N' } },
    address: 'Street A',
    street_number: '10',
    address_complement: null,
    neighborhood: 'Downtown',
    zip_code: '01000000',
    area_code: '11',
    phone_number: '12345678',
    school_year_start: null,
    school_year_end: null,
    censuses: [],
    reviews: [],
  }

  const makeRepo = (overrides: Partial<SchoolRepository> = {}): SchoolRepository => ({
    findById: vi.fn().mockResolvedValue(null),
    findWithFilters: vi.fn().mockResolvedValue({ count: 0, next: null, previous: null, results: [] }),
    findAll: vi.fn().mockResolvedValue({ count: 0, next: null, previous: null, results: [] }),
    ...overrides,
  })

  it('getById returns school when found', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(fakeSchool) })
    const service = new SchoolService(repo)

    const result = await service.getById(1)

    expect(result).toEqual(fakeSchool)
    expect(repo.findById).toHaveBeenCalledWith(1)
  })

  it('getById throws AppError 404 when not found', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) })
    const service = new SchoolService(repo)

    try {
      await service.getById(999)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })

  it('list delegates to findWithFilters', async () => {
    const repo = makeRepo()
    const service = new SchoolService(repo)

    await service.list({ name: 'test' }, { page: 1, pageSize: 30 })

    expect(repo.findWithFilters).toHaveBeenCalledWith({ name: 'test' }, { page: 1, pageSize: 30 })
  })

  it('listAll delegates to findAll', async () => {
    const repo = makeRepo()
    const service = new SchoolService(repo)

    await service.listAll({ page: 2, pageSize: 10 })

    expect(repo.findAll).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
  })
})
