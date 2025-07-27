export interface User {
  id: number
  name: string
  email: string
  phone: string
  birth_date: string
  gender: string
  bio?: string
  location?: string
  occupation?: string
  education?: string
  relationship_status?: string
  height?: number
  weight?: number
  interests?: string[]
  avatar_url?: string
  is_online?: boolean
  is_verified?: boolean
  is_premium?: boolean
  status?: string
  created_at?: string
  updated_at?: string
  preferences?: any
}

export interface UserProfile extends User {
  interests: string[]
  preferences: any | null
}
