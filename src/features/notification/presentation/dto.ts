import { z } from 'zod'

export const SimulateUpdateSchema = z.object({
  kind: z.enum(['indicators', 'budget']).default('indicators'),
})
