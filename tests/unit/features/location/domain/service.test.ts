import { describe, expect, it, vi } from 'vitest'
import type { City, State } from '../../../../../src/features/location/domain/models'
import type { LocationRepository } from '../../../../../src/features/location/domain/ports'
import { LocationService } from '../../../../../src/features/location/domain/service'

describe('LocationService', () => {
  const stateSP: State = { id: 1, name: 'Sao Paulo', abbreviation: 'SP', region: 'Southeast' }
  const stateRJ: State = { id: 2, name: 'Rio de Janeiro', abbreviation: 'RJ', region: 'Southeast' }
  const citySP: City = { id: 1, name: 'Sao Paulo', state: stateSP }

  const makeRepo = (overrides: Partial<LocationRepository> = {}): LocationRepository => ({
    findAllStates: vi.fn().mockResolvedValue([]),
    findAllCities: vi.fn().mockResolvedValue([]),
    ...overrides,
  })

  it('listStates delegates to the repository', async () => {
    const repo = makeRepo({
      findAllStates: vi.fn().mockResolvedValue([stateSP, stateRJ]),
    })
    const service = new LocationService(repo)

    const result = await service.listStates()

    expect(result).toEqual([stateSP, stateRJ])
    expect(repo.findAllStates).toHaveBeenCalledTimes(1)
  })

  it('listCities delegates to the repository', async () => {
    const repo = makeRepo({
      findAllCities: vi.fn().mockResolvedValue([citySP]),
    })
    const service = new LocationService(repo)

    const result = await service.listCities()

    expect(result).toEqual([citySP])
    expect(repo.findAllCities).toHaveBeenCalledTimes(1)
  })

  it('propagates repository errors', async () => {
    const repo = makeRepo({
      findAllStates: vi.fn().mockRejectedValue(new Error('db down')),
    })
    const service = new LocationService(repo)

    await expect(service.listStates()).rejects.toThrow('db down')
  })
})
