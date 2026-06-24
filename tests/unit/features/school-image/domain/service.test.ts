import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../../../src/shared/errors/AppError'
import type {
  ObjectStorage,
  PhotoPermissionChecker,
  SchoolImageRepository,
} from '../../../../../src/features/school-image/domain/ports'
import { SchoolImageService } from '../../../../../src/features/school-image/domain/service'

const VALID_DATA_URL = 'data:image/png;base64,aGVsbG8='

describe('SchoolImageService', () => {
  const makeRepo = (overrides: Partial<SchoolImageRepository> = {}): SchoolImageRepository => ({
    schoolExists: vi.fn().mockResolvedValue(true),
    findImage: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(undefined),
    updatePosition: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })

  const makeStorage = (overrides: Partial<ObjectStorage> = {}): ObjectStorage => ({
    put: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    publicUrl: vi.fn().mockImplementation((key: string) => `http://minio/escolas-images/${key}`),
    ...overrides,
  })

  const makePermissions = (canEdit = true): PhotoPermissionChecker => ({
    canEdit: vi.fn().mockResolvedValue(canEdit),
  })

  const expectStatus = async (promise: Promise<unknown>, status: number): Promise<void> => {
    try {
      await promise
      expect.fail('should have thrown')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(status)
    }
  }

  it('getImage returns null url and centered focal when the school has no custom image', async () => {
    const service = new SchoolImageService(makeRepo(), makeStorage(), makePermissions())

    expect(await service.getImage(1)).toEqual({ imageUrl: null, focalX: 0, focalY: 0 })
  })

  it('getImage returns the public url and the stored focal point', async () => {
    const repo = makeRepo({ findImage: vi.fn().mockResolvedValue({ objectKey: 'schools/1/a.png', focalX: 30, focalY: 70 }) })
    const service = new SchoolImageService(repo, makeStorage(), makePermissions())

    expect(await service.getImage(1)).toEqual({
      imageUrl: 'http://minio/escolas-images/schools/1/a.png',
      focalX: 30,
      focalY: 70,
    })
  })

  it('uploadImage stores the object and returns the url with a reset focal point', async () => {
    const repo = makeRepo()
    const storage = makeStorage()
    const service = new SchoolImageService(repo, storage, makePermissions())

    const view = await service.uploadImage(5, VALID_DATA_URL, 'user@test.com')

    expect(storage.put).toHaveBeenCalledTimes(1)
    expect(repo.upsert).toHaveBeenCalledTimes(1)
    expect(view.imageUrl).toContain('http://minio/escolas-images/schools/5/')
    expect(view.focalX).toBe(0)
    expect(view.focalY).toBe(0)
  })

  it('uploadImage removes the previous object when replacing an image', async () => {
    const repo = makeRepo({ findImage: vi.fn().mockResolvedValue({ objectKey: 'schools/5/old.png', focalX: 10, focalY: 20 }) })
    const storage = makeStorage()
    const service = new SchoolImageService(repo, storage, makePermissions())

    await service.uploadImage(5, VALID_DATA_URL, 'user@test.com')

    expect(storage.remove).toHaveBeenCalledWith('schools/5/old.png')
  })

  it('uploadImage throws 403 when the user cannot edit this school', async () => {
    const service = new SchoolImageService(makeRepo(), makeStorage(), makePermissions(false))

    await expectStatus(service.uploadImage(5, VALID_DATA_URL, 'user@test.com'), 403)
  })

  it('uploadImage throws 404 when the school does not exist', async () => {
    const service = new SchoolImageService(
      makeRepo({ schoolExists: vi.fn().mockResolvedValue(false) }),
      makeStorage(),
      makePermissions(),
    )

    await expectStatus(service.uploadImage(5, VALID_DATA_URL, 'user@test.com'), 404)
  })

  it('uploadImage throws 400 for a non-image data url', async () => {
    const service = new SchoolImageService(makeRepo(), makeStorage(), makePermissions())

    await expectStatus(service.uploadImage(5, 'data:text/plain;base64,aGVsbG8=', 'user@test.com'), 400)
  })

  it('updatePosition clamps the values and persists them', async () => {
    const repo = makeRepo({ findImage: vi.fn().mockResolvedValue({ objectKey: 'schools/5/a.png', focalX: 50, focalY: 50 }) })
    const service = new SchoolImageService(repo, makeStorage(), makePermissions())

    const view = await service.updatePosition(5, 400, -400, 'user@test.com')

    expect(repo.updatePosition).toHaveBeenCalledWith(5, 300, -300)
    expect(view.focalX).toBe(300)
    expect(view.focalY).toBe(-300)
  })

  it('updatePosition throws 403 when the user cannot edit this school', async () => {
    const service = new SchoolImageService(makeRepo(), makeStorage(), makePermissions(false))

    await expectStatus(service.updatePosition(5, 40, 60, 'user@test.com'), 403)
  })

  it('updatePosition throws 404 when the school has no image', async () => {
    const service = new SchoolImageService(makeRepo(), makeStorage(), makePermissions())

    await expectStatus(service.updatePosition(5, 40, 60, 'user@test.com'), 404)
  })

  it('deleteImage removes the object and the row when an image exists', async () => {
    const repo = makeRepo({ findImage: vi.fn().mockResolvedValue({ objectKey: 'schools/5/a.png', focalX: 50, focalY: 50 }) })
    const storage = makeStorage()
    const service = new SchoolImageService(repo, storage, makePermissions())

    await service.deleteImage(5, 'user@test.com')

    expect(repo.remove).toHaveBeenCalledWith(5)
    expect(storage.remove).toHaveBeenCalledWith('schools/5/a.png')
  })

  it('deleteImage throws 403 when the user cannot edit this school', async () => {
    const service = new SchoolImageService(makeRepo(), makeStorage(), makePermissions(false))

    await expectStatus(service.deleteImage(5, 'user@test.com'), 403)
  })

  it('deleteImage is a no-op when there is no custom image', async () => {
    const repo = makeRepo()
    const storage = makeStorage()
    const service = new SchoolImageService(repo, storage, makePermissions())

    await service.deleteImage(5, 'user@test.com')

    expect(repo.remove).not.toHaveBeenCalled()
    expect(storage.remove).not.toHaveBeenCalled()
  })
})
