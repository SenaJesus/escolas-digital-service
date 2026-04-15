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
import { sequelize } from './shared/database/sequelize'
import './shared/database/models'
import { errorHandler } from './shared/middleware/errorHandler'
import { requestLogger } from './shared/middleware/requestLogger'

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

  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(requestLogger)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: config.env })
  })

  app.use('/api', registerLocationRouter(locationService))
  app.use('/api', registerSchoolRouter(schoolService))
  app.use('/api', registerAuthRouter(authService))
  app.use('/api', registerReviewRouter(reviewService, tokenIssuer.verify.bind(tokenIssuer)))

  app.use(errorHandler)

  app.listen(config.port, () => {
    console.log(`[server] listening on :${config.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('[bootstrap failed]', err)
  process.exit(1)
})
