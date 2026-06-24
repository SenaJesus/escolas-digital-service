import { notFound } from '../../../shared/errors/AppError'
import type { BudgetReport } from './models'
import type { PddeRepository } from './ports'

export class BudgetService {
  constructor(private readonly repo: PddeRepository) {}

  async getBySchoolId(schoolId: number): Promise<BudgetReport> {
    const report = await this.repo.findBySchoolId(schoolId)
    if (!report) throw notFound('Escola não encontrada!')

    return report
  }
}
