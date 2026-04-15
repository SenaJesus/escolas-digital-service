import { z } from 'zod'

export const RequestAuthorizationSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório.'),
})

export const ConfirmAuthorizationSchema = z.object({
  email: z.string().min(1, 'Email e código são obrigatórios.'),
  verification_code: z.string().min(1, 'Email e código são obrigatórios.'),
})
