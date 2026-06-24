import { PddeProgramModel, PddeTransferModel, SchoolModel } from '../../../shared/database/models'
import type { BudgetProgram, BudgetReport, BudgetYearData } from '../domain/models'
import type { PddeRepository } from '../domain/ports'

export class SequelizePddeRepository implements PddeRepository {
  async findBySchoolId(schoolId: number): Promise<BudgetReport | null> {
    const school = await SchoolModel.findByPk(schoolId, { attributes: ['id'] })
    if (!school) return null

    const transfers = await PddeTransferModel.findAll({
      where: { school_id: schoolId },
      order: [['year', 'ASC']],
      raw: true,
    })

    if (transfers.length === 0) return { availableYears: [], yearly: [], data: {} }

    const programs = await PddeProgramModel.findAll({ where: { school_id: schoolId }, raw: true })

    const programsByYear = new Map<number, BudgetProgram[]>()
    for (const program of programs) {
      const list = programsByYear.get(program.year) ?? []
      list.push({ program: program.program, total: program.total })
      programsByYear.set(program.year, list)
    }

    const data: Record<number, BudgetYearData> = {}
    for (const transfer of transfers) {
      data[transfer.year] = {
        total: transfer.total,
        custeio: transfer.custeio,
        capital: transfer.capital,
        studentCount: transfer.student_count,
        capitalCustom: [
          { type: 'Custeio', amount: transfer.custeio },
          { type: 'Capital', amount: transfer.capital },
        ],
        programs: programsByYear.get(transfer.year) ?? [],
      }
    }

    return {
      availableYears: transfers.map((transfer) => transfer.year).sort((a, b) => b - a),
      yearly: transfers.map((transfer) => ({
        year: transfer.year,
        total: transfer.total,
        custeio: transfer.custeio,
        capital: transfer.capital,
      })),
      data,
    }
  }
}
