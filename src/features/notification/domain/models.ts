export type UpdateKind = 'indicators' | 'budget'

export type AppliedChange = {
  kind: UpdateKind
  field: string
  detail: string
}

export type SchoolSnapshot = {
  name: string
  inep: string
  city: string
  uf: string
  censusYear: number | null
  totalEnrollment: number | null
  enemYear: number | null
  enemAverage: number | null
  idebYear: number | null
  idebEarly: number | null
  pddeYear: number | null
  pddeTotal: number | null
}
