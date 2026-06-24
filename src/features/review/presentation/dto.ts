import { z } from 'zod'

export const SubmitReviewSchema = z.object({
  email: z.string().min(1, 'Email e nota são obrigatórios.'),
  rating: z.number().int(),
  comment: z.string().optional().default(''),
})

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1, 'A nota deve ser entre 1 e 5.').max(5, 'A nota deve ser entre 1 e 5.'),
  comment: z.string().optional().default(''),
})
