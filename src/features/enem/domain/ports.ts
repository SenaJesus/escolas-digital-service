import type { EnemReport } from './models'

export interface EnemRepository {
  findBySchoolId(schoolId: number): Promise<EnemReport | null>
}
