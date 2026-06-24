import { IdebScoreModel, SchoolModel } from '../../../shared/database/models'
import type { IdebStage } from '../../../shared/database/models/IdebScoreModel'
import type {
  IdebByLevel,
  IdebComponents,
  IdebEvolution,
  IdebReport,
  IdebVsTarget,
  IdebYearData,
} from '../domain/models'
import type { IdebRepository } from '../domain/ports'

type Score = {
  ideb: number | null
  learning: number | null
  flow: number | null
  target: number | null
}

const STAGE_LABELS: Record<IdebStage, string> = {
  early: 'Fund. Iniciais',
  late: 'Fund. Finais',
  high: 'Ensino Médio',
}

const STAGE_ORDER: IdebStage[] = ['early', 'late', 'high']

export class SequelizeIdebRepository implements IdebRepository {
  async findBySchoolId(schoolId: number): Promise<IdebReport | null> {
    const school = await SchoolModel.findByPk(schoolId, { attributes: ['id'] })
    if (!school) return null

    const scores = await IdebScoreModel.findAll({ where: { school_id: schoolId }, raw: true })
    if (scores.length === 0) return { availableYears: [], evolution: [], data: {} }

    const byYear = new Map<number, Map<IdebStage, Score>>()
    for (const score of scores) {
      const stageMap = byYear.get(score.year) ?? new Map<IdebStage, Score>()
      stageMap.set(score.stage, {
        ideb: score.ideb,
        learning: score.learning,
        flow: score.flow,
        target: score.target,
      })
      byYear.set(score.year, stageMap)
    }

    const years = [...byYear.keys()].sort((a, b) => a - b)

    const evolution: IdebEvolution[] = []
    const data: Record<number, IdebYearData> = {}
    const availableYears: number[] = []

    for (const year of years) {
      const stageMap = byYear.get(year)
      if (!stageMap) continue

      evolution.push({
        year,
        early: stageMap.get('early')?.ideb ?? null,
        late: stageMap.get('late')?.ideb ?? null,
        highSchool: stageMap.get('high')?.ideb ?? null,
      })

      const byLevel: IdebByLevel[] = []
      const vsTarget: IdebVsTarget[] = []
      const components: IdebComponents[] = []
      let hasIdeb = false

      for (const stage of STAGE_ORDER) {
        const score = stageMap.get(stage)
        if (!score) continue

        const level = STAGE_LABELS[stage]
        byLevel.push({ level, score: score.ideb })
        vsTarget.push({ level, actual: score.ideb, target: score.target })
        components.push({ level, flow: score.flow, performance: score.learning })
        if (score.ideb !== null) hasIdeb = true
      }

      data[year] = { byLevel, vsTarget, components }
      if (hasIdeb) availableYears.push(year)
    }

    return { availableYears: availableYears.sort((a, b) => b - a), evolution, data }
  }
}
