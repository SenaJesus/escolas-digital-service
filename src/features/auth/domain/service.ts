import { badRequest } from '../../../shared/errors/AppError'
import type { AuthRepository, EmailSender, TokenIssuer } from './ports'

const generateCode = (length = 6): string => {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }

  return code
}

export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly email: EmailSender,
    private readonly token: TokenIssuer,
  ) {}

  async requestAuthorization(emailStr: string): Promise<void> {
    if (!emailStr) throw badRequest('Email é obrigatório.')

    const code = generateCode()
    await this.repo.upsertForEmail(emailStr, code)
    await this.email.sendConfirmationCode(emailStr, code)
  }

  async confirmAuthorization(emailStr: string, verificationCode: string): Promise<string> {
    if (!emailStr || !verificationCode) throw badRequest('Email e código são obrigatórios.')

    const auth = await this.repo.findValid(emailStr, verificationCode)
    if (!auth) throw badRequest('Código inválido ou expirado.')

    const now = new Date()
    const expiresAt = new Date(auth.created_at.getTime() + 30 * 60 * 1000)
    if (now > expiresAt) throw badRequest('Código inválido ou expirado.')

    const jwt = this.token.issue(emailStr)
    await this.repo.invalidateForEmail(emailStr)

    return jwt
  }
}
