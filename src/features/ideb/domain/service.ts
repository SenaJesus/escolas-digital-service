import { notFound } from '../../../shared/errors/AppError'
import type { IdebReport } from './models'
import type { IdebRepository } from './ports'

export class IdebService {
  constructor(private readonly repo: IdebRepository) {}

  async getBySchoolId(schoolId: number): Promise<IdebReport> {
    const report = await this.repo.findBySchoolId(schoolId)
    if (!report) throw notFound('Escola não encontrada!')

    return report
  }
}
