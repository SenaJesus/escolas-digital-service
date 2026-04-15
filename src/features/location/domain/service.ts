import type { City, State } from './models'
import type { LocationRepository } from './ports'

export class LocationService {
  constructor(private readonly repo: LocationRepository) {}

  listStates(): Promise<State[]> {
    return this.repo.findAllStates()
  }

  listCities(): Promise<City[]> {
    return this.repo.findAllCities()
  }
}
