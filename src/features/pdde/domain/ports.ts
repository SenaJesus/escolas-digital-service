import type { BudgetReport } from './models'

export interface PddeRepository {
  findBySchoolId(schoolId: number): Promise<BudgetReport | null>
}
