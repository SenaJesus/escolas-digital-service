import { notFound } from '../../../shared/errors/AppError'
import type { EnemReport } from './models'
import type { EnemRepository } from './ports'

export class EnemService {
  constructor(private readonly repo: EnemRepository) {}

  async getBySchoolId(schoolId: number): Promise<EnemReport> {
    const report = await this.repo.findBySchoolId(schoolId)
    if (!report) throw notFound('Escola não encontrada!')

    return report
  }
}
