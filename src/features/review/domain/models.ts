export type Review = {
  id: number
  school_id: number
  email: string
  rating: number
  comment: string | null
  created_at: Date
}

export type SubmitInput = {
  school_id: number
  email: string
  rating: number
  comment?: string
}
