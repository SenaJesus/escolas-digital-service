import { describe, expect, it, vi } from 'vitest'
import { AppError, badRequest } from '../../../../../src/shared/errors/AppError'
import type { StoredUser } from '../../../../../src/features/user/domain/models'
import type {
  AccountTokenIssuer,
  CodeVerifier,
  PasswordHasher,
  UserRepository,
} from '../../../../../src/features/user/domain/ports'
import { UserService } from '../../../../../src/features/user/domain/service'

describe('UserService', () => {
  const storedUser: StoredUser = {
    id: 1,
    name: 'Maria',
    email: 'maria@example.com',
    password_hash: 'hashed',
    is_admin: false,
    can_edit_photos: false,
  }

  const makeRepo = (overrides: Partial<UserRepository> = {}): UserRepository => ({
    findByEmail: vi.fn().mockResolvedValue(storedUser),
    emailExists: vi.fn().mockResolvedValue(false),
    schoolsExist: vi.fn().mockResolvedValue(true),
    create: vi.fn().mockResolvedValue(1),
    updateName: vi.fn().mockResolvedValue(undefined),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    setChildSchools: vi.fn().mockResolvedValue(undefined),
    getChildSchools: vi.fn().mockResolvedValue([]),
    getPhotoSchoolIds: vi.fn().mockResolvedValue([]),
    countReviews: vi.fn().mockResolvedValue(2),
    countSubscriptions: vi.fn().mockResolvedValue(3),
    deleteReviews: vi.fn().mockResolvedValue(2),
    deleteSubscriptions: vi.fn().mockResolvedValue(3),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })

  const makeHasher = (compareResult = true): PasswordHasher => ({
    hash: vi.fn().mockResolvedValue('hashed'),
    compare: vi.fn().mockResolvedValue(compareResult),
  })

  const makeVerifier = (valid = true): CodeVerifier => ({
    verify: valid ? vi.fn().mockResolvedValue(undefined) : vi.fn().mockRejectedValue(badRequest('Código inválido ou expirado.')),
  })

  const token: AccountTokenIssuer = { issue: vi.fn().mockReturnValue('jwt-token') }

  const expectStatus = async (promise: Promise<unknown>, status: number): Promise<void> => {
    try {
      await promise
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(status)
    }
  }

  const registerInput = {
    name: 'Maria',
    email: 'maria@example.com',
    password: 'secret123',
    verification_code: '123456',
    child_school_ids: [] as number[],
  }

  it('register verifies the code, links the child schools and returns a token plus the account', async () => {
    const repo = makeRepo()
    const hasher = makeHasher()
    const verifier = makeVerifier()
    const service = new UserService(repo, hasher, token, verifier)

    const result = await service.register({ ...registerInput, child_school_ids: [9, 12] })

    expect(verifier.verify).toHaveBeenCalledWith('maria@example.com', '123456')
    expect(hasher.hash).toHaveBeenCalledWith('secret123')
    expect(repo.setChildSchools).toHaveBeenCalledWith(1, [9, 12])
    expect(result.token).toBe('jwt-token')
    expect(result.account).toMatchObject({ name: 'Maria', review_count: 2, subscription_count: 3 })
  })

  it('register throws 409 when the email already exists', async () => {
    const service = new UserService(makeRepo({ emailExists: vi.fn().mockResolvedValue(true) }), makeHasher(), token, makeVerifier())

    await expectStatus(service.register(registerInput), 409)
  })

  it('register throws 400 when the verification code is invalid', async () => {
    const service = new UserService(makeRepo(), makeHasher(), token, makeVerifier(false))

    await expectStatus(service.register(registerInput), 400)
  })

  it('register throws 400 when a child school does not exist', async () => {
    const service = new UserService(makeRepo({ schoolsExist: vi.fn().mockResolvedValue(false) }), makeHasher(), token, makeVerifier())

    await expectStatus(service.register({ ...registerInput, child_school_ids: [999] }), 400)
  })

  it('login throws 401 when the user does not exist', async () => {
    const service = new UserService(makeRepo({ findByEmail: vi.fn().mockResolvedValue(null) }), makeHasher(), token, makeVerifier())

    await expectStatus(service.login('x@example.com', 'secret'), 401)
  })

  it('login throws 401 when the password does not match', async () => {
    const service = new UserService(makeRepo(), makeHasher(false), token, makeVerifier())

    await expectStatus(service.login('maria@example.com', 'wrong'), 401)
  })

  it('updateProfile updates the name and replaces the child schools', async () => {
    const repo = makeRepo()
    const service = new UserService(repo, makeHasher(), token, makeVerifier())

    await service.updateProfile('maria@example.com', { name: 'Maria Silva', child_school_ids: [7] })

    expect(repo.updateName).toHaveBeenCalledWith('maria@example.com', 'Maria Silva')
    expect(repo.setChildSchools).toHaveBeenCalledWith(1, [7])
  })

  it('updatePassword throws 400 when the current password is wrong', async () => {
    const service = new UserService(makeRepo(), makeHasher(false), token, makeVerifier())

    await expectStatus(service.updatePassword('maria@example.com', 'wrong', 'newsecret'), 400)
  })

  it('deleteAccount verifies the code, removes reviews and subscriptions and reports the counts', async () => {
    const repo = makeRepo()
    const verifier = makeVerifier()
    const service = new UserService(repo, makeHasher(), token, verifier)

    const result = await service.deleteAccount('maria@example.com', '654321', {
      deleteReviews: true,
      deleteSubscriptions: true,
    })

    expect(verifier.verify).toHaveBeenCalledWith('maria@example.com', '654321')
    expect(result).toEqual({ deleted_reviews: 2, deleted_subscriptions: 3 })
    expect(repo.deleteReviews).toHaveBeenCalledWith('maria@example.com')
    expect(repo.deleteSubscriptions).toHaveBeenCalledWith('maria@example.com')
    expect(repo.deleteUser).toHaveBeenCalledWith('maria@example.com')
  })

  it('deleteAccount keeps reviews/subscriptions when the flags are false', async () => {
    const repo = makeRepo()
    const service = new UserService(repo, makeHasher(), token, makeVerifier())

    const result = await service.deleteAccount('maria@example.com', '654321', {
      deleteReviews: false,
      deleteSubscriptions: false,
    })

    expect(repo.deleteReviews).not.toHaveBeenCalled()
    expect(repo.deleteSubscriptions).not.toHaveBeenCalled()
    expect(repo.deleteUser).toHaveBeenCalledWith('maria@example.com')
    expect(result).toEqual({ deleted_reviews: 0, deleted_subscriptions: 0 })
  })

  it('deleteAccount throws 400 when the verification code is invalid', async () => {
    const repo = makeRepo()
    const service = new UserService(repo, makeHasher(), token, makeVerifier(false))

    await expectStatus(
      service.deleteAccount('maria@example.com', 'wrong', { deleteReviews: true, deleteSubscriptions: true }),
      400,
    )
    expect(repo.deleteUser).not.toHaveBeenCalled()
  })
})
