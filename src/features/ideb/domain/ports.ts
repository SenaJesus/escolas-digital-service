import type { IdebReport } from './models'

export interface IdebRepository {
  findBySchoolId(schoolId: number): Promise<IdebReport | null>
}
