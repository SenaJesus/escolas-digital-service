import { AuthorizationModel } from '../../../shared/database/models'
import type { Authorization } from '../domain/models'
import type { AuthRepository } from '../domain/ports'

export class SequelizeAuthRepository implements AuthRepository {
  async upsertForEmail(email: string, verificationCode: string): Promise<void> {
    const [row, created] = await AuthorizationModel.findOrCreate({
      where: { email },
      defaults: { email, verification_code: verificationCode, created_at: new Date(), is_valid: true },
    })

    if (!created)
      await row.update({ verification_code: verificationCode, created_at: new Date(), is_valid: true })
  }

  async findValid(email: string, verificationCode: string): Promise<Authorization | null> {
    const row = await AuthorizationModel.findOne({
      where: { email, verification_code: verificationCode, is_valid: true },
    })
    if (!row) return null

    return {
      id: row.id,
      email: row.email,
      verification_code: row.verification_code,
      created_at: row.created_at,
      is_valid: row.is_valid,
    }
  }

  async invalidateForEmail(email: string): Promise<void> {
    await AuthorizationModel.update({ is_valid: false }, { where: { email, is_valid: true } })
  }
}
