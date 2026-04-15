import { Router, type Request, type Response, type NextFunction } from 'express'
import type { City, State } from '../domain/models'
import { toCityDTO, toStateDTO } from './dto'

export interface LocationUseCases {
  listStates(): Promise<State[]>
  listCities(): Promise<City[]>
}

export const registerLocationRouter = (service: LocationUseCases): Router => {
  const router = Router()

  router.get('/states', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const states = await service.listStates()

      res.status(200).json(states.map(toStateDTO))
    } catch (err) {
      next(err)
    }
  })

  router.get('/cities', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cities = await service.listCities()

      res.status(200).json(cities.map(toCityDTO))
    } catch (err) {
      next(err)
    }
  })

  return router
}
