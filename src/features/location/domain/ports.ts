import type { City, State } from './models'

export interface LocationRepository {
  findAllStates(): Promise<State[]>
  findAllCities(): Promise<City[]>
}
