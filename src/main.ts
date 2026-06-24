import cors from 'cors'
import express from 'express'
import { config } from './config'
import { AuthService } from './features/auth/domain/service'
import { JwtTokenIssuer } from './features/auth/infrastructure/JwtTokenIssuer'
import { NodemailerEmailSender } from './features/auth/infrastructure/NodemailerEmailSender'
import { SequelizeAuthRepository } from './features/auth/infrastructure/SequelizeAuthRepository'
import { registerAuthRouter } from './features/auth/presentation/router'
import { LocationService } from './features/location/domain/service'
import { SequelizeLocationRepository } from './features/location/infrastructure/SequelizeLocationRepository'
import { registerLocationRouter } from './features/location/presentation/router'
import { ReviewService } from './features/review/domain/service'
import { SequelizeReviewRepository } from './features/review/infrastructure/SequelizeReviewRepository'
import { registerReviewRouter } from './features/review/presentation/router'
import { SchoolService } from './features/school/domain/service'
import { SequelizeSchoolRepository } from './features/school/infrastructure/SequelizeSchoolRepository'
import { registerSchoolRouter } from './features/school/presentation/router'
import { EnemService } from './features/enem/domain/service'
import { SequelizeEnemRepository } from './features/enem/infrastructure/SequelizeEnemRepository'
import { registerEnemRouter } from './features/enem/presentation/router'
import { IdebService } from './features/ideb/domain/service'
import { SequelizeIdebRepository } from './features/ideb/infrastructure/SequelizeIdebRepository'
import { registerIdebRouter } from './features/ideb/presentation/router'
import { BudgetService } from './features/pdde/domain/service'
import { SequelizePddeRepository } from './features/pdde/infrastructure/SequelizePddeRepository'
import { registerBudgetRouter } from './features/pdde/presentation/router'
import { SubscriptionService } from './features/subscription/domain/service'
import { SequelizeSubscriptionRepository } from './features/subscription/infrastructure/SequelizeSubscriptionRepository'
import { registerSubscriptionRouter } from './features/subscription/presentation/router'
import { NotificationService } from './features/notification/domain/service'
import { SequelizeNotificationRepository } from './features/notification/infrastructure/SequelizeNotificationRepository'
import { registerNotificationRouter } from './features/notification/presentation/router'
import { UserService } from './features/user/domain/service'
import { SequelizeUserRepository } from './features/user/infrastructure/SequelizeUserRepository'
import { BcryptPasswordHasher } from './features/user/infrastructure/BcryptPasswordHasher'
import { registerUserRouter } from './features/user/presentation/router'
import { SchoolImageService } from './features/school-image/domain/service'
import { MinioStorage } from './features/school-image/infrastructure/MinioStorage'
import { SequelizeSchoolImageRepository } from './features/school-image/infrastructure/SequelizeSchoolImageRepository'
import { SequelizePhotoPermissionChecker } from './features/school-image/infrastructure/SequelizePhotoPermissionChecker'
import { registerSchoolImageRouter } from './features/school-image/presentation/router'
import { AdminService } from './features/admin/domain/service'
import { SequelizeAdminRepository } from './features/admin/infrastructure/SequelizeAdminRepository'
import { registerAdminRouter } from './features/admin/presentation/router'
import { sequelize } from './shared/database/sequelize'
import './shared/database/models'
import { errorHandler } from './shared/middleware/errorHandler'
import { requestLogger } from './shared/middleware/requestLogger'

const ensureBucketWithRetry = async (storage: MinioStorage): Promise<void> => {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await storage.ensureBucket()
      console.log('[storage] bucket ready')

      return
    } catch (err) {
      if (attempt === 10) {
        console.warn('[storage] bucket not ready (uploads disabled until MinIO is up):', err)

        return
      }
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }
}

const bootstrap = async (): Promise<void> => {
  await sequelize.authenticate()
  console.log('[db] connected')

  const locationRepo = new SequelizeLocationRepository()
  const schoolRepo = new SequelizeSchoolRepository()
  const authRepo = new SequelizeAuthRepository()
  const reviewRepo = new SequelizeReviewRepository()
  const emailSender = new NodemailerEmailSender(config.smtp)
  const tokenIssuer = new JwtTokenIssuer(config.jwt)

  const locationService = new LocationService(locationRepo)
  const schoolService = new SchoolService(schoolRepo)
  const authService = new AuthService(authRepo, emailSender, tokenIssuer)
  const reviewService = new ReviewService(reviewRepo, emailSender)
  const enemService = new EnemService(new SequelizeEnemRepository())
  const idebService = new IdebService(new SequelizeIdebRepository())
  const budgetService = new BudgetService(new SequelizePddeRepository())
  const subscriptionService = new SubscriptionService(new SequelizeSubscriptionRepository())
  const notificationService = new NotificationService(new SequelizeNotificationRepository(), emailSender)
  const userService = new UserService(
    new SequelizeUserRepository(),
    new BcryptPasswordHasher(),
    tokenIssuer,
    { verify: (email, code) => authService.verifyCode(email, code) },
  )

  const imageStorage = new MinioStorage(config.s3)

  await ensureBucketWithRetry(imageStorage)

  const schoolImageService = new SchoolImageService(
    new SequelizeSchoolImageRepository(),
    imageStorage,
    new SequelizePhotoPermissionChecker(),
  )

  const adminService = new AdminService(new SequelizeAdminRepository())

  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '8mb' }))
  app.use(requestLogger)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: config.env })
  })

  app.use('/api', registerLocationRouter(locationService))
  app.use('/api', registerSchoolRouter(schoolService))
  app.use('/api', registerAuthRouter(authService))
  app.use('/api', registerReviewRouter(reviewService, tokenIssuer.verify.bind(tokenIssuer)))
  app.use('/api', registerEnemRouter(enemService))
  app.use('/api', registerIdebRouter(idebService))
  app.use('/api', registerBudgetRouter(budgetService))
  app.use('/api', registerSubscriptionRouter(subscriptionService, tokenIssuer.verify.bind(tokenIssuer)))
  app.use('/api', registerNotificationRouter(notificationService))
  app.use('/api', registerUserRouter(userService, tokenIssuer.verify.bind(tokenIssuer)))
  app.use('/api', registerSchoolImageRouter(schoolImageService, tokenIssuer.verify.bind(tokenIssuer)))
  app.use('/api', registerAdminRouter(adminService, tokenIssuer.verify.bind(tokenIssuer)))

  app.use(errorHandler)

  app.listen(config.port, () => {
    console.log(`[server] listening on :${config.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('[bootstrap failed]', err)
  process.exit(1)
})
