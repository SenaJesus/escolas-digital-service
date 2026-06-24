import path from 'node:path'
import { PddeProgramModel, PddeTransferModel } from '../../shared/database/models'
import { insertInBatches } from '../shared/batch'
import { streamCsv } from '../shared/csvStream'
import { toFloat, toInt } from '../shared/coerce'
import { dataDir, listFiles, log } from '../shared/paths'
import { loadSchoolIndex } from '../shared/schoolIndex'

type Money = { custeio: number; capital: number; total: number; students: number }

const round2 = (value: number): number => Math.round(value * 100) / 100

const add = (map: Map<string, Money>, key: string, custeio: number, capital: number, total: number, students: number): void => {
  const acc = map.get(key) ?? { custeio: 0, capital: 0, total: 0, students: 0 }
  acc.custeio += custeio
  acc.capital += capital
  acc.total += total
  if (students > acc.students) acc.students = students
  map.set(key, acc)
}

export const run = async (): Promise<void> => {
  const dir = dataDir('pdde')
  const files = listFiles(dir).filter((file) => /\.(txt|csv)(\.gz)?$/i.test(file))

  if (files.length === 0) {
    log('pdde', `nenhum arquivo em ${dir} — pulando`)

    return
  }

  log('pdde', 'carregando índice de escolas...')
  const schools = await loadSchoolIndex()
  log('pdde', `${schools.size} escolas indexadas`)

  const transfers = new Map<string, Money>()
  const programs = new Map<string, Money>()

  for (const file of files) {
    log('pdde', `processando ${path.basename(file)}...`)
    let matched = 0

    const total = await streamCsv(file, (row) => {
      const code = row.CO_ESCOLA
      if (!code) return

      const school = schools.get(code.trim())
      if (!school) return

      const year = toInt(row.AN_EXERCICIO)
      if (year === 0) return

      const custeio = toFloat(row.VL_PAGO_CUSTEIO) ?? 0
      const capital = toFloat(row.VL_PAGO_CAPITAL) ?? 0
      const totalValue = toFloat(row.VL_PAGO_TOTAL) ?? custeio + capital
      const students = toInt(row.QT_ALUNOS)
      const rawProgram = (row.DS_PROGRAMA_FNDE ?? '').trim()
      const program = /^[A-Za-zÀ-ÿ]/.test(rawProgram) ? rawProgram : 'PDDE'

      add(transfers, `${school.id}:${year}`, custeio, capital, totalValue, students)
      add(programs, `${school.id}:${year}:${program}`, custeio, capital, totalValue, 0)
      matched += 1
    })

    log('pdde', `${path.basename(file)}: ${total} linhas, ${matched} cruzadas`)
  }

  log('pdde', 'limpando tabelas pdde...')
  await PddeTransferModel.destroy({ where: {}, truncate: true })
  await PddeProgramModel.destroy({ where: {}, truncate: true })

  const transferRows = [...transfers].map(([key, money]) => {
    const [schoolId, year] = key.split(':')

    return {
      school_id: Number(schoolId),
      year: Number(year),
      custeio: round2(money.custeio),
      capital: round2(money.capital),
      total: round2(money.total),
      student_count: money.students > 0 ? money.students : null,
    }
  })

  const programRows = [...programs].map(([key, money]) => {
    const [schoolId, year, ...rest] = key.split(':')

    return {
      school_id: Number(schoolId),
      year: Number(year),
      program: rest.join(':'),
      custeio: round2(money.custeio),
      capital: round2(money.capital),
      total: round2(money.total),
    }
  })

  log('pdde', `inserindo ${transferRows.length} repasses...`)
  await insertInBatches(PddeTransferModel, transferRows)

  log('pdde', `inserindo ${programRows.length} repasses por programa...`)
  await insertInBatches(PddeProgramModel, programRows)

  log('pdde', 'concluído')
}
