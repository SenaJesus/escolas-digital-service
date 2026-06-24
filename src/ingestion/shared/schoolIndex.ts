import { CityModel, SchoolModel } from '../../shared/database/models'

export type SchoolRef = {
  id: number
  cityId: number
  stateId: number
}

export type SchoolIndex = Map<string, SchoolRef>

export const loadSchoolIndex = async (): Promise<SchoolIndex> => {
  const cities = await CityModel.findAll({ attributes: ['id', 'state_id'], raw: true })
  const cityToState = new Map<number, number>()
  for (const city of cities) cityToState.set(city.id, city.state_id)

  const schools = await SchoolModel.findAll({
    attributes: ['id', 'ibge_code', 'city_id'],
    raw: true,
  })

  const index: SchoolIndex = new Map()
  for (const school of schools) {
    const stateId = cityToState.get(school.city_id)
    if (stateId === undefined) continue

    index.set(school.ibge_code.trim(), { id: school.id, cityId: school.city_id, stateId })
  }

  return index
}
