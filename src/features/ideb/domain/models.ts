export type IdebByLevel = {
  level: string
  score: number | null
}

export type IdebVsTarget = {
  level: string
  actual: number | null
  target: number | null
}

export type IdebComponents = {
  level: string
  flow: number | null
  performance: number | null
}

export type IdebEvolution = {
  year: number
  early: number | null
  late: number | null
  highSchool: number | null
}

export type IdebYearData = {
  byLevel: IdebByLevel[]
  vsTarget: IdebVsTarget[]
  components: IdebComponents[]
}

export type IdebReport = {
  availableYears: number[]
  evolution: IdebEvolution[]
  data: Record<number, IdebYearData>
}
