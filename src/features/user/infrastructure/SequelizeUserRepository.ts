import {
  CityModel,
  ReviewModel,
  SchoolModel,
  StateModel,
  SubscriptionModel,
  UserChildSchoolModel,
  UserModel,
  UserPhotoSchoolModel,
} from '../../../shared/database/models'
import type { ChildSchool, StoredUser } from '../domain/models'
import type { UserRepository } from '../domain/ports'

const unique = (ids: number[]): number[] => [...new Set(ids)]

export class SequelizeUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<StoredUser | null> {
    const user = await UserModel.findOne({ where: { email } })
    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password_hash,
      is_admin: user.is_admin,
      can_edit_photos: user.can_edit_photos,
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ where: { email }, attributes: ['id'] })

    return user !== null
  }

  async schoolsExist(schoolIds: number[]): Promise<boolean> {
    const ids = unique(schoolIds)
    if (ids.length === 0) return true

    const count = await SchoolModel.count({ where: { id: ids } })

    return count === ids.length
  }

  async create(input: { name: string; email: string; passwordHash: string }): Promise<number> {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      password_hash: input.passwordHash,
    })

    return user.id
  }

  async updateName(email: string, name: string): Promise<void> {
    await UserModel.update({ name, updated_at: new Date() }, { where: { email } })
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await UserModel.update(
      { password_hash: passwordHash, updated_at: new Date() },
      { where: { email } },
    )
  }

  async setChildSchools(userId: number, schoolIds: number[]): Promise<void> {
    await UserChildSchoolModel.destroy({ where: { user_id: userId } })

    const ids = unique(schoolIds)
    if (ids.length === 0) return

    await UserChildSchoolModel.bulkCreate(ids.map((school_id) => ({ user_id: userId, school_id })))
  }

  async getChildSchools(userId: number): Promise<ChildSchool[]> {
    const links = await UserChildSchoolModel.findAll({
      where: { user_id: userId },
      attributes: ['school_id'],
      raw: true,
    })
    const ids = links.map((link) => link.school_id)
    if (ids.length === 0) return []

    const schools = await SchoolModel.findAll({ where: { id: ids }, attributes: ['id', 'name', 'city_id'] })

    const cityIds = unique(schools.map((school) => school.city_id))
    const cities = await CityModel.findAll({ where: { id: cityIds }, attributes: ['id', 'name', 'state_id'] })
    const cityById = new Map(cities.map((city) => [city.id, city]))

    const stateIds = unique(cities.map((city) => city.state_id))
    const states = await StateModel.findAll({ where: { id: stateIds }, attributes: ['id', 'abbreviation'] })
    const stateById = new Map(states.map((state) => [state.id, state]))

    return schools.map((school) => {
      const city = cityById.get(school.city_id)
      const state = city ? stateById.get(city.state_id) : undefined

      return { id: school.id, name: school.name, city: city?.name ?? '—', uf: state?.abbreviation ?? '—' }
    })
  }

  async getPhotoSchoolIds(userId: number): Promise<number[]> {
    const links = await UserPhotoSchoolModel.findAll({
      where: { user_id: userId },
      attributes: ['school_id'],
      raw: true,
    })

    return links.map((link) => link.school_id)
  }

  countReviews(email: string): Promise<number> {
    return ReviewModel.count({ where: { email } })
  }

  countSubscriptions(email: string): Promise<number> {
    return SubscriptionModel.count({ where: { email } })
  }

  deleteReviews(email: string): Promise<number> {
    return ReviewModel.destroy({ where: { email } })
  }

  deleteSubscriptions(email: string): Promise<number> {
    return SubscriptionModel.destroy({ where: { email } })
  }

  async deleteUser(email: string): Promise<void> {
    await UserModel.destroy({ where: { email } })
  }
}
