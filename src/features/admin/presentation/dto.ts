import { z } from 'zod'

export const UpdatePhotoPermissionsSchema = z.object({
  can_edit_photos: z.boolean(),
  school_ids: z.array(z.number().int().positive()).default([]),
})
