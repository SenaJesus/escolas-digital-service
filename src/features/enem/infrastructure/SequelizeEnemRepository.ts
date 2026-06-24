import { CityModel, EnemAggregateModel, EnemResultModel, SchoolModel } from '../../../shared/database/models'
import type {
  EnemComparison,
  EnemDistribution,
  EnemReport,
  EnemSubject,
  EnemYearData,
} from '../domain/models'
import type { EnemRepository } from '../domain/ports'

type Means = {
  avg_cn: number | null
  avg_ch: number | null
  avg_lc: number | null
  avg_mt: number | null
  avg_essay: number | null
}

const subjectsOf = (means: Means): EnemSubject[] => [
  { subject: 'Matemática', score: means.avg_mt },
  { subject: 'Linguagens', score: means.avg_lc },
  { subject: 'C. Humanas', score: means.avg_ch },
  { subject: 'C. Natureza', score: means.avg_cn },
  { subject: 'Redação', score: means.avg_essay },
]

const comparisonRow = (scope: string, means: Means | undefined): EnemComparison => ({
  scope,
  matematica: means?.avg_mt ?? null,
  linguagens: means?.avg_lc ?? null,
  humanas: means?.avg_ch ?? null,
  natureza: means?.avg_cn ?? null,
  redacao: means?.avg_essay ?? null,
})

export class SequelizeEnemRepository implements EnemRepository {
  async findBySchoolId(schoolId: number): Promise<EnemReport | null> {
    const school = await SchoolModel.findByPk(schoolId, { attributes: ['id', 'city_id'] })
    if (!school) return null

    const city = await CityModel.findByPk(school.city_id, { attributes: ['id', 'state_id'] })
    const stateId = city?.state_id ?? null

    const results = await EnemResultModel.findAll({
      where: { school_id: schoolId },
      order: [['year', 'ASC']],
      raw: true,
    })

    if (results.length === 0) return { availableYears: [], yearly: [], data: {} }

    const years = results.map((result) => result.year)

    const aggregates = await EnemAggregateModel.findAll({ where: { year: years }, raw: true })

    const cityByYear = new Map<number, Means>()
    const stateByYear = new Map<number, Means>()
    const countryByYear = new Map<number, Means>()

    for (const aggregate of aggregates) {
      if (aggregate.scope === 'country') countryByYear.set(aggregate.year, aggregate)
      else if (aggregate.scope === 'city' && aggregate.city_id === school.city_id)
        cityByYear.set(aggregate.year, aggregate)
      else if (aggregate.scope === 'state' && stateId !== null && aggregate.state_id === stateId)
        stateByYear.set(aggregate.year, aggregate)
    }

    const data: Record<number, EnemYearData> = {}

    for (const result of results) {
      const distribution: EnemDistribution[] = [
        { range: '< 400', students: result.dist_lt_400 },
        { range: '400-500', students: result.dist_400_500 },
        { range: '500-600', students: result.dist_500_600 },
        { range: '600-700', students: result.dist_600_700 },
        { range: '> 700', students: result.dist_gt_700 },
      ]

      data[result.year] = {
        subjects: subjectsOf(result),
        comparison: [
          comparisonRow('Escola', result),
          comparisonRow('Cidade', cityByYear.get(result.year)),
          comparisonRow('Estado', stateByYear.get(result.year)),
          comparisonRow('Brasil', countryByYear.get(result.year)),
        ],
        distribution,
      }
    }

    return {
      availableYears: [...years].sort((a, b) => b - a),
      yearly: results.map((result) => ({ year: result.year, average: result.avg_general })),
      data,
    }
  }
}
