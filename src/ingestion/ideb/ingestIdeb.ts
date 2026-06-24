import path from 'node:path'
import * as XLSX from 'xlsx'
import { IdebScoreModel } from '../../shared/database/models'
import type { IdebStage } from '../../shared/database/models/IdebScoreModel'
import { insertInBatches } from '../shared/batch'
import { dataDir, listFiles, log } from '../shared/paths'
import { loadSchoolIndex } from '../shared/schoolIndex'

const HEADER_ROW = 7
const FIRST_DATA_ROW = 8

const stageOf = (file: string): IdebStage | null => {
  const name = path.basename(file).toLowerCase()
  if (name.includes('anos_iniciais')) return 'early'
  if (name.includes('anos_finais')) return 'late'
  if (name.includes('ensino_medio')) return 'high'

  return null
}

const num = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const text = String(value).trim()
  if (text === '' || text === '-') return null

  const parsed = Number(text.replace(',', '.'))

  return Number.isFinite(parsed) ? parsed : null
}

export const run = async (): Promise<void> => {
  const dir = dataDir('ideb')
  const files = listFiles(dir).filter((file) => file.toLowerCase().endsWith('.xlsx'))

  if (files.length === 0) {
    log('ideb', `nenhum xlsx em ${dir} — pulando`)

    return
  }

  log('ideb', 'carregando índice de escolas...')
  const schools = await loadSchoolIndex()
  log('ideb', `${schools.size} escolas indexadas`)

  log('ideb', 'limpando tabela ideb_scores...')
  await IdebScoreModel.destroy({ where: {}, truncate: true })

  for (const file of files) {
    const stage = stageOf(file)
    if (!stage) {
      log('ideb', `${path.basename(file)}: etapa não reconhecida — pulando`)
      continue
    }

    const workbook = XLSX.readFile(file)
    const sheetName = workbook.SheetNames[0]
    if (sheetName === undefined) continue

    const sheet = workbook.Sheets[sheetName]
    if (sheet === undefined) continue

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' })

    const header = (rows[HEADER_ROW] ?? []).map(String)
    const col = new Map<string, number>()
    header.forEach((name, index) => col.set(name, index))

    const schoolCol = col.get('ID_ESCOLA')
    if (schoolCol === undefined) {
      log('ideb', `${path.basename(file)}: coluna ID_ESCOLA ausente — pulando`)
      continue
    }

    const years = [
      ...new Set(
        header
          .map((name) => name.match(/^VL_OBSERVADO_(\d{4})$/)?.[1])
          .filter((year): year is string => year !== undefined),
      ),
    ].map(Number)

    const idebRows: Array<{
      school_id: number
      year: number
      stage: IdebStage
      ideb: number | null
      learning: number | null
      flow: number | null
      target: number | null
    }> = []

    let matched = 0

    for (let r = FIRST_DATA_ROW; r < rows.length; r += 1) {
      const row = rows[r]
      if (!row) continue

      const code = String(row[schoolCol] ?? '').trim()
      if (!code) continue

      const school = schools.get(code)
      if (!school) continue

      let hasAny = false

      for (const year of years) {
        const ideb = num(row[col.get(`VL_OBSERVADO_${year}`) ?? -1])
        const learning = num(row[col.get(`VL_NOTA_MEDIA_${year}`) ?? -1])
        const flow = num(row[col.get(`VL_INDICADOR_REND_${year}`) ?? -1])
        const target = num(row[col.get(`VL_PROJECAO_${year}`) ?? -1])

        if (ideb === null && learning === null && flow === null && target === null) continue

        idebRows.push({ school_id: school.id, year, stage, ideb, learning, flow, target })
        hasAny = true
      }

      if (hasAny) matched += 1
    }

    log('ideb', `${path.basename(file)} (${stage}): ${matched} escolas, ${idebRows.length} registros`)
    await insertInBatches(IdebScoreModel, idebRows)
  }

  log('ideb', 'concluído')
}
