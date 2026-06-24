import bcrypt from 'bcryptjs'
import type { PasswordHasher } from '../domain/ports'

export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
