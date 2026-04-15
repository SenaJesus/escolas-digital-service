import { z } from 'zod'

export const SubmitReviewSchema = z.object({
  email: z.string().min(1, 'Email e nota são obrigatórios.'),
  rating: z.number().int(),
  comment: z.string().optional().default(''),
})
