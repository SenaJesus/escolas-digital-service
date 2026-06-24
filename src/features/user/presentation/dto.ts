import { z } from 'zod'
import type { AccountSummary } from '../domain/models'

const childSchoolIds = z.array(z.number().int().positive()).default([])

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
  verification_code: z.string().min(1, 'Informe o código de confirmação.'),
  child_school_ids: childSchoolIds,
})

export const DeleteAccountSchema = z.object({
  verification_code: z.string().min(1, 'Informe o código de confirmação.'),
  delete_reviews: z.boolean().default(true),
  delete_subscriptions: z.boolean().default(true),
})

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
})

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  child_school_ids: childSchoolIds,
})

export const PasswordSchema = z.object({
  current_password: z.string().min(1, 'Informe a senha atual.'),
  new_password: z.string().min(6, 'A nova senha deve ter ao menos 6 caracteres.'),
})

export const toAccountDTO = (account: AccountSummary): Record<string, unknown> => ({
  name: account.name,
  email: account.email,
  child_schools: account.child_schools,
  review_count: account.review_count,
  subscription_count: account.subscription_count,
  is_admin: account.is_admin,
  can_edit_photos: account.can_edit_photos,
  photo_school_ids: account.photo_school_ids,
})
