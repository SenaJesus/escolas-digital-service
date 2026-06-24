import bcrypt from 'bcryptjs'
import { sequelize } from '../shared/database/sequelize'
import { UserModel } from '../shared/database/models'

const ADMIN_NAME = 'Administrador'
const ADMIN_EMAIL = 'admin@escolas.digital'
const ADMIN_PASSWORD = 'admin123'

const run = async (): Promise<void> => {
  await sequelize.authenticate()

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const existing = await UserModel.findOne({ where: { email: ADMIN_EMAIL } })

  if (existing) {
    existing.name = ADMIN_NAME
    existing.password_hash = passwordHash
    existing.is_admin = true
    existing.can_edit_photos = true
    existing.updated_at = new Date()
    await existing.save()
  } else {
    await UserModel.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      is_admin: true,
      can_edit_photos: true,
    })
  }

  console.log(`admin pronto: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

  await sequelize.close()
}

run().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
