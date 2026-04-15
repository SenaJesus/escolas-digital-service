import jwt from 'jsonwebtoken'
import type { TokenIssuer } from '../domain/ports'

type JwtConfig = {
  secret: string
  expirationMinutes: number
}

export class JwtTokenIssuer implements TokenIssuer {
  private readonly secret: string
  private readonly expirationMinutes: number

  constructor(config: JwtConfig) {
    this.secret = config.secret
    this.expirationMinutes = config.expirationMinutes
  }

  issue(email: string): string {
    const now = Math.floor(Date.now() / 1000)

    return jwt.sign(
      {
        email,
        iat: now,
        exp: now + this.expirationMinutes * 60,
      },
      this.secret,
      { algorithm: 'HS256' },
    )
  }

  verify(token: string): { email: string } | null {
    try {
      const payload = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as { email: string }

      return { email: payload.email }
    } catch {
      return null
    }
  }
}
