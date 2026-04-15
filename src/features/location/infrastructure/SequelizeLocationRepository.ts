import { StateModel, CityModel } from '../../../shared/database/models'
import type { City, State } from '../domain/models'
import type { LocationRepository } from '../domain/ports'

export class SequelizeLocationRepository implements LocationRepository {
  async findAllStates(): Promise<State[]> {
    const rows = await StateModel.findAll({ order: [['id', 'ASC']] })

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      abbreviation: r.abbreviation,
      region: r.region,
    }))
  }

  async findAllCities(): Promise<City[]> {
    const rows = await CityModel.findAll({
      include: [{ model: StateModel, as: 'state' }],
      order: [['id', 'ASC']],
    })

    return rows.map((r) => {
      const state = (r as CityModel & { state: StateModel }).state

      return {
        id: r.id,
        name: r.name,
        state: {
          id: state.id,
          name: state.name,
          abbreviation: state.abbreviation,
          region: state.region,
        },
      }
    })
  }
}
