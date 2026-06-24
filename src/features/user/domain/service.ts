import { badRequest, conflict, notFound, unauthorized } from '../../../shared/errors/AppError'
import type { AccountSummary, ProfileInput, RegisterInput } from './models'
import type { AccountTokenIssuer, CodeVerifier, PasswordHasher, UserRepository } from './ports'

export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly token: AccountTokenIssuer,
    private readonly codeVerifier: CodeVerifier,
  ) {}

  async register(input: RegisterInput): Promise<{ token: string; account: AccountSummary }> {
    if (await this.repo.emailExists(input.email))
      throw conflict('Já existe uma conta com este e-mail.')

    await this.codeVerifier.verify(input.email, input.verification_code)
    await this.ensureSchoolsExist(input.child_school_ids)

    const passwordHash = await this.hasher.hash(input.password)
    const userId = await this.repo.create({ name: input.name, email: input.email, passwordHash })
    await this.repo.setChildSchools(userId, input.child_school_ids)

    return { token: this.token.issue(input.email), account: await this.buildAccount(input.email) }
  }

  async login(email: string, password: string): Promise<{ token: string; account: AccountSummary }> {
    const user = await this.repo.findByEmail(email)
    if (!user) throw unauthorized('E-mail ou senha inválidos.')

    const matches = await this.hasher.compare(password, user.password_hash)
    if (!matches) throw unauthorized('E-mail ou senha inválidos.')

    return { token: this.token.issue(email), account: await this.buildAccount(email) }
  }

  async getAccount(email: string): Promise<AccountSummary> {
    await this.requireUser(email)

    return this.buildAccount(email)
  }

  async updateProfile(email: string, input: ProfileInput): Promise<AccountSummary> {
    const user = await this.requireUser(email)
    await this.ensureSchoolsExist(input.child_school_ids)
    await this.repo.updateName(email, input.name)
    await this.repo.setChildSchools(user.id, input.child_school_ids)

    return this.buildAccount(email)
  }

  async updatePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.requireUser(email)

    const matches = await this.hasher.compare(currentPassword, user.password_hash)
    if (!matches) throw badRequest('Senha atual incorreta.')

    await this.repo.updatePassword(email, await this.hasher.hash(newPassword))
  }

  async deleteAccount(
    email: string,
    verificationCode: string,
    options: { deleteReviews: boolean; deleteSubscriptions: boolean },
  ): Promise<{ deleted_reviews: number; deleted_subscriptions: number }> {
    await this.requireUser(email)
    await this.codeVerifier.verify(email, verificationCode)

    const deletedReviews = options.deleteReviews ? await this.repo.deleteReviews(email) : 0
    const deletedSubscriptions = options.deleteSubscriptions ? await this.repo.deleteSubscriptions(email) : 0
    await this.repo.deleteUser(email)

    return { deleted_reviews: deletedReviews, deleted_subscriptions: deletedSubscriptions }
  }

  private async requireUser(email: string) {
    const user = await this.repo.findByEmail(email)
    if (!user) throw notFound('Conta não encontrada.')

    return user
  }

  private async ensureSchoolsExist(schoolIds: number[]): Promise<void> {
    const exists = await this.repo.schoolsExist(schoolIds)
    if (!exists) throw badRequest('Uma das escolas informadas não existe.')
  }

  private async buildAccount(email: string): Promise<AccountSummary> {
    const user = await this.requireUser(email)

    return {
      name: user.name,
      email: user.email,
      child_schools: await this.repo.getChildSchools(user.id),
      review_count: await this.repo.countReviews(email),
      subscription_count: await this.repo.countSubscriptions(email),
      is_admin: user.is_admin,
      can_edit_photos: user.can_edit_photos,
      photo_school_ids: await this.repo.getPhotoSchoolIds(user.id),
    }
  }
}
