export type AdminUserRow = {
  id: number
  name: string
  email: string
  is_admin: boolean
  can_edit_photos: boolean
  photo_school_ids: number[]
}
