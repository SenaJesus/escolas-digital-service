import { z } from 'zod'

export const UploadImageSchema = z.object({
  image: z.string().min(1, 'Imagem é obrigatória.'),
})

export const UpdatePositionSchema = z.object({
  focal_x: z.number().min(-300).max(300),
  focal_y: z.number().min(-300).max(300),
})
