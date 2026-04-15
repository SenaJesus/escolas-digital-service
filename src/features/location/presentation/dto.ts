import type { City, State } from '../domain/models'

export type StateDTO = {
  id: number
  name: string
  abbreviation: string
  region: string
}

export type CityDTO = {
  id: number
  name: string
  state: StateDTO
}

export function toStateDTO(s: State): StateDTO {
  return { id: s.id, name: s.name, abbreviation: s.abbreviation, region: s.region }
}

export function toCityDTO(c: City): CityDTO {
  return { id: c.id, name: c.name, state: toStateDTO(c.state) }
}
