import path from 'node:path'
import type { CreationAttributes } from 'sequelize'
import {
  AccessibilityModel,
  CityModel,
  EducationRecordModel,
  InfrastructureModel,
  InternetAccessModel,
  QuotasModel,
  SchoolCensusModel,
  SchoolModel,
  StaffMembersModel,
  StateModel,
} from '../../shared/database/models'
import { sequelize } from '../../shared/database/sequelize'
import { streamCsv, type CsvRow } from '../shared/csvStream'
import { insertInBatches } from '../shared/batch'
import { nullableStr, str, toBool, toDate, toInt } from '../shared/coerce'
import { dataDir, listFiles, log } from '../shared/paths'
import {
  ACCESSIBILITY,
  EDUCATION_BOOL,
  EDUCATION_INT,
  INFRA_BOOL,
  INFRA_INT,
  INTERNET,
  QUOTAS,
  STAFF,
} from './columns'

const BATCH = 2000

type SchoolAttrs = {
  name: string
  dependency_type: number
  private_school_category: number | null
  location_type: number
  cityKey: string
  address: string
  street_number: string | null
  address_complement: string | null
  neighborhood: string | null
  zip_code: string
  area_code: string | null
  phone_number: string | null
  school_year_start: string | null
  school_year_end: string | null
}

const cityKeyOf = (name: string, abbreviation: string): string => `${name}|${abbreviation}`

const yearOf = (file: string): number | null => {
  const match = path.basename(file).match(/(\d{4})/)

  return match ? Number(match[1]) : null
}

const mapBools = (row: CsvRow, map: Record<string, string>): Record<string, boolean> => {
  const out: Record<string, boolean> = {}
  for (const [field, column] of Object.entries(map)) out[field] = toBool(row[column])

  return out
}

const mapInts = (row: CsvRow, map: Record<string, string>): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const [field, column] of Object.entries(map)) out[field] = toInt(row[column])

  return out
}

const readSchool = (row: CsvRow): SchoolAttrs => {
  const category = nullableStr(row.TP_CATEGORIA_ESCOLA_PRIVADA)

  return {
    name: str(row.NO_ENTIDADE, 'Sem Nome'),
    dependency_type: toInt(row.TP_DEPENDENCIA) || 1,
    private_school_category: category === null ? null : toInt(category),
    location_type: toInt(row.TP_LOCALIZACAO) || 1,
    cityKey: cityKeyOf(str(row.NO_MUNICIPIO), str(row.SG_UF)),
    address: str(row.DS_ENDERECO),
    street_number: nullableStr(row.NU_ENDERECO),
    address_complement: nullableStr(row.DS_COMPLEMENTO),
    neighborhood: nullableStr(row.NO_BAIRRO),
    zip_code: str(row.CO_CEP),
    area_code: nullableStr(row.NU_DDD),
    phone_number: nullableStr(row.NU_TELEFONE),
    school_year_start: toDate(row.DT_ANO_LETIVO_INICIO),
    school_year_end: toDate(row.DT_ANO_LETIVO_TERMINO),
  }
}

type Pending = {
  schoolId: number
  year: number
  accessibility: Record<string, boolean>
  internet: Record<string, boolean>
  staff: Record<string, number>
  quotas: Record<string, boolean>
  infra: Record<string, boolean | number>
  education: Record<string, boolean | number>
}

const flush = async (buffer: Pending[]): Promise<void> => {
  if (buffer.length === 0) return

  const accessibilities = await AccessibilityModel.bulkCreate(
    buffer.map((item) => item.accessibility) as unknown as CreationAttributes<AccessibilityModel>[],
  )
  const internets = await InternetAccessModel.bulkCreate(
    buffer.map((item) => item.internet) as unknown as CreationAttributes<InternetAccessModel>[],
  )
  const staff = await StaffMembersModel.bulkCreate(
    buffer.map((item) => item.staff) as unknown as CreationAttributes<StaffMembersModel>[],
  )
  const quotas = await QuotasModel.bulkCreate(
    buffer.map((item) => item.quotas) as unknown as CreationAttributes<QuotasModel>[],
  )
  const censuses = await SchoolCensusModel.bulkCreate(
    buffer.map((item) => ({ school_id: item.schoolId, year: item.year })) as unknown as CreationAttributes<SchoolCensusModel>[],
  )

  const infraRows: CreationAttributes<InfrastructureModel>[] = []
  const educationRows: CreationAttributes<EducationRecordModel>[] = []

  for (let i = 0; i < buffer.length; i += 1) {
    const item = buffer[i]
    const census = censuses[i]
    const accessibility = accessibilities[i]
    const internet = internets[i]
    const staffMember = staff[i]
    const quota = quotas[i]
    if (!item || !census || !accessibility || !internet || !staffMember || !quota) continue

    infraRows.push({
      census_id: census.id,
      ...item.infra,
      accessibility_id: accessibility.id,
      internet_access_id: internet.id,
      staff_members_id: staffMember.id,
    } as unknown as CreationAttributes<InfrastructureModel>)

    educationRows.push({
      census_id: census.id,
      ...item.education,
      quotas_id: quota.id,
    } as unknown as CreationAttributes<EducationRecordModel>)
  }

  await InfrastructureModel.bulkCreate(infraRows)
  await EducationRecordModel.bulkCreate(educationRows)
}

export const run = async (): Promise<void> => {
  const dir = dataDir('censo')
  const files = listFiles(dir)
    .filter((file) => file.toLowerCase().endsWith('.csv'))
    .map((file) => ({ file, year: yearOf(file) }))
    .filter((entry): entry is { file: string; year: number } => entry.year !== null)
    .sort((a, b) => b.year - a.year)

  if (files.length === 0) {
    log('censo', `nenhum microdado em ${dir} — pulando`)

    return
  }

  const states = new Map<string, { name: string; region: string }>()
  const cities = new Map<string, { name: string; abbreviation: string }>()
  const schools = new Map<string, SchoolAttrs>()

  for (const { file } of files) {
    log('censo', `lendo ${path.basename(file)} (estados/cidades/escolas)...`)
    await streamCsv(file, (row) => {
      const abbreviation = str(row.SG_UF)
      if (abbreviation && !states.has(abbreviation))
        states.set(abbreviation, { name: str(row.NO_UF), region: str(row.NO_REGIAO, 'Desconhecida') })

      const cityName = str(row.NO_MUNICIPIO)
      const cityKey = cityKeyOf(cityName, abbreviation)
      if (cityName && abbreviation && !cities.has(cityKey))
        cities.set(cityKey, { name: cityName, abbreviation })

      const ibge = str(row.CO_ENTIDADE)
      if (ibge && !schools.has(ibge)) schools.set(ibge, readSchool(row))
    })
  }

  log('censo', 'limpando tabelas do censo...')
  await sequelize.query(
    'TRUNCATE states, cities, schools, school_censuses, accessibilities, internet_access, staff_members, quotas, infrastructures, education_records RESTART IDENTITY CASCADE',
  )

  log('censo', `criando ${states.size} estados...`)
  const stateIdByAbbr = new Map<string, number>()
  for (const [abbreviation, data] of states) {
    const created = await StateModel.create(
      { name: data.name, abbreviation, region: data.region } as unknown as CreationAttributes<StateModel>,
    )
    stateIdByAbbr.set(abbreviation, created.id)
  }

  log('censo', `criando ${cities.size} cidades...`)
  const cityRows = [...cities].map(([, data]) => ({
    name: data.name,
    state_id: stateIdByAbbr.get(data.abbreviation) as number,
  }))
  await insertInBatches(CityModel, cityRows as unknown as CreationAttributes<CityModel>[])

  const cityIdByKey = new Map<string, number>()
  const cityModels = await CityModel.findAll({ attributes: ['id', 'name', 'state_id'], raw: true })
  const abbrByStateId = new Map<number, string>()
  for (const [abbreviation, id] of stateIdByAbbr) abbrByStateId.set(id, abbreviation)
  for (const city of cityModels)
    cityIdByKey.set(cityKeyOf(city.name, abbrByStateId.get(city.state_id) ?? ''), city.id)

  log('censo', `criando ${schools.size} escolas...`)
  const schoolRows = [...schools].map(([ibge, attrs]) => ({
    name: attrs.name,
    ibge_code: ibge,
    dependency_type: attrs.dependency_type,
    private_school_category: attrs.private_school_category,
    location_type: attrs.location_type,
    city_id: cityIdByKey.get(attrs.cityKey) as number,
    address: attrs.address,
    street_number: attrs.street_number,
    address_complement: attrs.address_complement,
    neighborhood: attrs.neighborhood,
    zip_code: attrs.zip_code,
    area_code: attrs.area_code,
    phone_number: attrs.phone_number,
    school_year_start: attrs.school_year_start,
    school_year_end: attrs.school_year_end,
  })).filter((row) => row.city_id !== undefined)
  await insertInBatches(SchoolModel, schoolRows as unknown as CreationAttributes<SchoolModel>[])

  const schoolIdByIbge = new Map<string, number>()
  const schoolModels = await SchoolModel.findAll({ attributes: ['id', 'ibge_code'], raw: true })
  for (const school of schoolModels) schoolIdByIbge.set(school.ibge_code, school.id)

  for (const { file, year } of files) {
    log('censo', `importando censos de ${year}...`)
    let buffer: Pending[] = []
    let count = 0

    await streamCsv(file, async (row) => {
      const ibge = str(row.CO_ENTIDADE)
      const schoolId = ibge ? schoolIdByIbge.get(ibge) : undefined
      if (schoolId === undefined) return

      buffer.push({
        schoolId,
        year,
        accessibility: mapBools(row, ACCESSIBILITY),
        internet: mapBools(row, INTERNET),
        staff: mapInts(row, STAFF),
        quotas: mapBools(row, QUOTAS),
        infra: { ...mapBools(row, INFRA_BOOL), ...mapInts(row, INFRA_INT) },
        education: { ...mapBools(row, EDUCATION_BOOL), ...mapInts(row, EDUCATION_INT) },
      })

      if (buffer.length >= BATCH) {
        await flush(buffer)
        count += buffer.length
        buffer = []
      }
    })

    await flush(buffer)
    count += buffer.length
    log('censo', `${year}: ${count} censos importados`)
  }

  log('censo', 'concluído')
}
