import type { WhereOptions } from 'sequelize'
import {
  CityModel,
  EducationRecordModel,
  EnemResultModel,
  IdebScoreModel,
  PddeTransferModel,
  SchoolCensusModel,
  SchoolModel,
  StateModel,
  SubscriptionModel,
} from '../../../shared/database/models'
import type { AppliedChange, SchoolSnapshot, UpdateKind } from '../domain/models'
import type { NotificationRepository } from '../domain/ports'

const fmtNumber = (value: number): string => value.toLocaleString('pt-BR')

const fmtCurrency = (value: number): string =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals

  return Math.round(value * factor) / factor
}

export class SequelizeNotificationRepository implements NotificationRepository {
  async schoolExists(schoolId: number): Promise<boolean> {
    const school = await SchoolModel.findByPk(schoolId, { attributes: ['id'] })

    return school !== null
  }

  async applyChange(schoolId: number, kind: UpdateKind): Promise<AppliedChange> {
    if (kind === 'budget') {
      const pdde = await PddeTransferModel.findOne({
        where: { school_id: schoolId },
        order: [['year', 'DESC']],
      })

      if (pdde) {
        const previous = pdde.total
        const increment = 1000

        pdde.capital = round(pdde.capital + increment, 2)
        pdde.total = round(pdde.total + increment, 2)
        await pdde.save()

        return {
          kind,
          field: `Repasse PDDE ${String(pdde.year)}`,
          detail: `Um novo repasse foi registrado: o total subiu de ${fmtCurrency(previous)} para ${fmtCurrency(pdde.total)}.`,
        }
      }

      return { kind, field: 'Repasse PDDE', detail: 'Um novo repasse do PDDE foi registrado para esta escola.' }
    }

    const ideb = await IdebScoreModel.findOne({
      where: { school_id: schoolId, stage: 'early' },
      order: [['year', 'DESC']],
    })

    if (ideb && ideb.ideb !== null) {
      const previous = ideb.ideb

      ideb.ideb = round(ideb.ideb + 0.1, 1)
      await ideb.save()

      return {
        kind,
        field: `IDEB Anos Iniciais ${String(ideb.year)}`,
        detail: `O IDEB dos Anos Iniciais subiu de ${fmtNumber(previous)} para ${fmtNumber(ideb.ideb)}.`,
      }
    }

    const enem = await EnemResultModel.findOne({
      where: { school_id: schoolId },
      order: [['year', 'DESC']],
    })

    if (enem && enem.avg_general !== null) {
      const previous = enem.avg_general

      enem.avg_general = round(enem.avg_general + 1, 2)
      await enem.save()

      return {
        kind,
        field: `Média ENEM ${String(enem.year)}`,
        detail: `A média geral do ENEM subiu de ${fmtNumber(previous)} para ${fmtNumber(enem.avg_general)}.`,
      }
    }

    return {
      kind,
      field: 'Indicadores',
      detail: 'Novos dados de ENEM, IDEB e Censo foram divulgados para esta escola.',
    }
  }

  async getSnapshot(schoolId: number): Promise<SchoolSnapshot | null> {
    const school = await SchoolModel.findByPk(schoolId, {
      attributes: ['id', 'name', 'ibge_code', 'city_id'],
    })
    if (!school) return null

    const city = await CityModel.findByPk(school.city_id, { attributes: ['id', 'name', 'state_id'] })
    const state = city ? await StateModel.findByPk(city.state_id, { attributes: ['abbreviation'] }) : null

    const census = await SchoolCensusModel.findOne({
      where: { school_id: schoolId },
      order: [['year', 'DESC']],
    })

    let totalEnrollment: number | null = null
    if (census) {
      const education = await EducationRecordModel.findOne({ where: { census_id: census.id }, raw: true })
      if (education)
        totalEnrollment =
          education.early_childhood_enrollment_count +
          education.elementary_enrollment_count +
          education.high_school_enrollment_count +
          education.adult_education_enrollment_count +
          education.special_education_enrollment_count
    }

    const enem = await EnemResultModel.findOne({
      where: { school_id: schoolId },
      order: [['year', 'DESC']],
    })
    const ideb = await IdebScoreModel.findOne({
      where: { school_id: schoolId, stage: 'early' },
      order: [['year', 'DESC']],
    })
    const pdde = await PddeTransferModel.findOne({
      where: { school_id: schoolId },
      order: [['year', 'DESC']],
    })

    return {
      name: school.name,
      inep: school.ibge_code,
      city: city?.name ?? '—',
      uf: state?.abbreviation ?? '—',
      censusYear: census?.year ?? null,
      totalEnrollment,
      enemYear: enem?.year ?? null,
      enemAverage: enem?.avg_general ?? null,
      idebYear: ideb?.year ?? null,
      idebEarly: ideb?.ideb ?? null,
      pddeYear: pdde?.year ?? null,
      pddeTotal: pdde?.total ?? null,
    }
  }

  async findSubscribers(schoolId: number, kind: UpdateKind): Promise<string[]> {
    const where: WhereOptions = { school_id: schoolId, is_active: true }
    if (kind === 'budget') where.notify_budget = true
    else where.notify_indicators = true

    const rows = await SubscriptionModel.findAll({ where, attributes: ['email'], raw: true })

    return rows.map((row) => row.email)
  }
}
