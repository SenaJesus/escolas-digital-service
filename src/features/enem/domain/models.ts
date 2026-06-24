export type EnemSubject = {
  subject: string
  score: number | null
}

export type EnemYearly = {
  year: number
  average: number | null
}

export type EnemComparison = {
  scope: string
  matematica: number | null
  linguagens: number | null
  humanas: number | null
  natureza: number | null
  redacao: number | null
}

export type EnemDistribution = {
  range: string
  students: number
}

export type EnemYearData = {
  subjects: EnemSubject[]
  comparison: EnemComparison[]
  distribution: EnemDistribution[]
}

export type EnemReport = {
  availableYears: number[]
  yearly: EnemYearly[]
  data: Record<number, EnemYearData>
}
