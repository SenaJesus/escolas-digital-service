export type StoredUser = {
  id: number
  name: string
  email: string
  password_hash: string
  is_admin: boolean
  can_edit_photos: boolean
}

export type ChildSchool = {
  id: number
  name: string
  city: string
  uf: string
}

export type AccountSummary = {
  name: string
  email: string
  child_schools: ChildSchool[]
  review_count: number
  subscription_count: number
  is_admin: boolean
  can_edit_photos: boolean
  photo_school_ids: number[]
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  verification_code: string
  child_school_ids: number[]
}

export type ProfileInput = {
  name: string
  child_school_ids: number[]
}
