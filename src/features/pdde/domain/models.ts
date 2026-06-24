export type BudgetYearly = {
  year: number
  total: number
  custeio: number
  capital: number
}

export type BudgetCapitalCustom = {
  type: string
  amount: number
}

export type BudgetProgram = {
  program: string
  total: number
}

export type BudgetYearData = {
  total: number
  custeio: number
  capital: number
  studentCount: number | null
  capitalCustom: BudgetCapitalCustom[]
  programs: BudgetProgram[]
}

export type BudgetReport = {
  availableYears: number[]
  yearly: BudgetYearly[]
  data: Record<number, BudgetYearData>
}
