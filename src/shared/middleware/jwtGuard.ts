import type { NextFunction, Request, Response } from 'express'
import { unauthorized } from '../errors/AppError'

export type JwtVerifier = (token: string) => { email: string } | null

declare module 'express-serve-static-core' {
  interface Request {
    jwtPayload?: { email: string }
  }
}

export const makeJwtGuard = (verify: JwtVerifier) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer '))
      return next(unauthorized('Token de autorização não fornecido.'))

    const token = authHeader.slice('Bearer '.length).trim()
    const payload = verify(token)

    if (!payload)
      return next(unauthorized('Token inválido ou expirado. É necessário confirmar o email novamente.'))

    req.jwtPayload = payload
    next()
  }
