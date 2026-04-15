export type State = {
  id: number
  name: string
  abbreviation: string
  region: string
}

export type City = {
  id: number
  name: string
  state: State
}
