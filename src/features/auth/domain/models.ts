export type Authorization = {
  id: number
  email: string
  verification_code: string
  created_at: Date
  is_valid: boolean
}
