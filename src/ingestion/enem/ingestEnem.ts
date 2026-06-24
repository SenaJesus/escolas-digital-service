import path from 'node:path'
import { EnemAggregateModel, EnemResultModel } from '../../shared/database/models'
import { insertInBatches } from '../shared/batch'
import { streamCsv, type CsvRow } from '../shared/csvStream'
import { toFloat, toInt } from '../shared/coerce'
import { dataDir, listFiles, log } from '../shared/paths'
import { loadSchoolIndex, type SchoolIndex } from '../shared/schoolIndex'

type Measure = {
  cn: number | null
  ch: number | null
  lc: number | null
  mt: number | null
  essay: number | null
  general: number | null
}

type Acc = {
  cnSum: number
  cnW: number
  chSum: number
  chW: number
  lcSum: number
  lcW: number
  mtSum: number
  mtW: number
  essaySum: number
  essayW: number
  genSum: number
  genW: number
  participants: number
  buckets: [number, number, number, number, number]
}

const newAcc = (): Acc => ({
  cnSum: 0, cnW: 0,
  chSum: 0, chW: 0,
  lcSum: 0, lcW: 0,
  mtSum: 0, mtW: 0,
  essaySum: 0, essayW: 0,
  genSum: 0, genW: 0,
  participants: 0,
  buckets: [0, 0, 0, 0, 0],
})

const get = (map: Map<string, Acc>, key: string): Acc => {
  const existing = map.get(key)
  if (existing) return existing

  const created = newAcc()
  map.set(key, created)

  return created
}

const round2 = (value: number): number => Math.round(value * 100) / 100

const mean = (sum: number, weight: number): number | null =>
  weight > 0 ? round2(sum / weight) : null

const bucketOf = (general: number): number =>
  general < 400 ? 0 : general < 500 ? 1 : general < 600 ? 2 : general < 700 ? 3 : 4

const accumulate = (
  acc: Acc,
  m: Measure,
  weight: number,
  participants: number,
  bucket: number | null,
): void => {
  if (m.cn !== null) { acc.cnSum += m.cn * weight; acc.cnW += weight }
  if (m.ch !== null) { acc.chSum += m.ch * weight; acc.chW += weight }
  if (m.lc !== null) { acc.lcSum += m.lc * weight; acc.lcW += weight }
  if (m.mt !== null) { acc.mtSum += m.mt * weight; acc.mtW += weight }
  if (m.essay !== null) { acc.essaySum += m.essay * weight; acc.essayW += weight }
  if (m.general !== null) { acc.genSum += m.general * weight; acc.genW += weight }

  acc.participants += participants
  if (bucket !== null) acc.buckets[bucket] = (acc.buckets[bucket] ?? 0) + 1
}

const generalOf = (values: Array<number | null>): number | null => {
  const present = values.filter((value): value is number => value !== null && value > 0)
  if (present.length === 0) return null

  return present.reduce((sum, value) => sum + value, 0) / present.length
}

const isAggregateFile = (filePath: string): boolean =>
  path.basename(filePath).toUpperCase().includes('ENEM_ESCOLA')

export const run = async (): Promise<void> => {
  const dir = dataDir('enem')
  const files = listFiles(dir).filter((file) => file.toLowerCase().endsWith('.csv'))

  if (files.length === 0) {
    log('enem', `nenhum csv em ${dir} — pulando`)

    return
  }

  log('enem', 'carregando índice de escolas...')
  const schools: SchoolIndex = await loadSchoolIndex()
  log('enem', `${schools.size} escolas indexadas`)

  const schoolAcc = new Map<string, Acc>()
  const cityAcc = new Map<string, Acc>()
  const stateAcc = new Map<string, Acc>()
  const countryAcc = new Map<string, Acc>()

  const spread = (key: { school: string; city: string; state: string; country: string }, m: Measure, weight: number, participants: number, bucket: number | null): void => {
    accumulate(get(schoolAcc, key.school), m, weight, participants, bucket)
    accumulate(get(cityAcc, key.city), m, weight, participants, bucket)
    accumulate(get(stateAcc, key.state), m, weight, participants, bucket)
    accumulate(get(countryAcc, key.country), m, weight, participants, bucket)
  }

  for (const file of files) {
    const aggregate = isAggregateFile(file)
    log('enem', `processando ${path.basename(file)} (${aggregate ? 'agregado' : 'microdados'})...`)

    let matched = 0

    const total = await streamCsv(file, (row: CsvRow) => {
      const code = aggregate ? row.CO_ESCOLA_EDUCACENSO : row.CO_ESCOLA
      if (!code) return

      const school = schools.get(code.trim())
      if (!school) return

      const year = toInt(row.NU_ANO)
      if (year < 2009) return

      const keys = {
        school: `${school.id}:${year}`,
        city: `${school.cityId}:${year}`,
        state: `${school.stateId}:${year}`,
        country: `${year}`,
      }

      if (aggregate) {
        const participants = toInt(row.NU_PARTICIPANTES)
        if (participants <= 0) return

        const cn = toFloat(row.NU_MEDIA_CN)
        const ch = toFloat(row.NU_MEDIA_CH)
        const lc = toFloat(row.NU_MEDIA_LP)
        const mt = toFloat(row.NU_MEDIA_MT)
        const essay = toFloat(row.NU_MEDIA_RED)
        const general = generalOf([cn, ch, lc, mt, essay])
        if (general === null) return

        const m: Measure = { cn, ch, lc, mt, essay, general: round2(general) }
        spread(keys, m, participants, participants, null)
        matched += 1

        return
      }

      const cn = toFloat(row.NU_NOTA_CN)
      const ch = toFloat(row.NU_NOTA_CH)
      const lc = toFloat(row.NU_NOTA_LC)
      const mt = toFloat(row.NU_NOTA_MT)
      const essay = toFloat(row.NU_NOTA_REDACAO)
      const general = generalOf([cn, ch, lc, mt, essay])
      if (general === null) return

      const m: Measure = { cn, ch, lc, mt, essay, general: round2(general) }
      spread(keys, m, 1, 1, bucketOf(general))
      matched += 1
    })

    log('enem', `${path.basename(file)}: ${total} linhas, ${matched} cruzadas`)
  }

  log('enem', 'limpando tabelas enem...')
  await EnemResultModel.destroy({ where: {}, truncate: true })
  await EnemAggregateModel.destroy({ where: {}, truncate: true })

  const resultRows = [...schoolAcc].map(([key, acc]) => {
    const [schoolId, year] = key.split(':')

    return {
      school_id: Number(schoolId),
      year: Number(year),
      avg_cn: mean(acc.cnSum, acc.cnW),
      avg_ch: mean(acc.chSum, acc.chW),
      avg_lc: mean(acc.lcSum, acc.lcW),
      avg_mt: mean(acc.mtSum, acc.mtW),
      avg_essay: mean(acc.essaySum, acc.essayW),
      avg_general: mean(acc.genSum, acc.genW),
      participant_count: Math.round(acc.participants),
      dist_lt_400: acc.buckets[0],
      dist_400_500: acc.buckets[1],
      dist_500_600: acc.buckets[2],
      dist_600_700: acc.buckets[3],
      dist_gt_700: acc.buckets[4],
    }
  })

  const aggRows = [
    ...[...cityAcc].map(([key, acc]) => ({ scope: 'city' as const, key, acc })),
    ...[...stateAcc].map(([key, acc]) => ({ scope: 'state' as const, key, acc })),
    ...[...countryAcc].map(([key, acc]) => ({ scope: 'country' as const, key, acc })),
  ].map(({ scope, key, acc }) => {
    const parts = key.split(':')
    const year = Number(parts[parts.length - 1])

    return {
      scope,
      city_id: scope === 'city' ? Number(parts[0]) : null,
      state_id: scope === 'state' ? Number(parts[0]) : null,
      year,
      avg_cn: mean(acc.cnSum, acc.cnW),
      avg_ch: mean(acc.chSum, acc.chW),
      avg_lc: mean(acc.lcSum, acc.lcW),
      avg_mt: mean(acc.mtSum, acc.mtW),
      avg_essay: mean(acc.essaySum, acc.essayW),
      avg_general: mean(acc.genSum, acc.genW),
      participant_count: Math.round(acc.participants),
    }
  })

  log('enem', `inserindo ${resultRows.length} resultados por escola...`)
  await insertInBatches(EnemResultModel, resultRows)

  log('enem', `inserindo ${aggRows.length} agregados (cidade/estado/brasil)...`)
  await insertInBatches(EnemAggregateModel, aggRows)

  log('enem', 'concluído')
}
