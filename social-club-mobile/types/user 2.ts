// 复制自web项目的用户类型定义
export interface UserProfile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  isOnline: boolean
  // 扩展的个人资料字段
  occupation?: string
  education?: string
  relationship_status?: string
  height?: number
  weight?: number
  ethnicity?: string
  religion?: string
  employer?: string
  school?: string
  degree?: string
  values_preferences?: string[]
  personality_type?: string
  languages?: string[]
  family_plans?: string
  has_kids?: string | boolean
  smoking_status?: string
  drinking_status?: string
  dating_style?: string
  relationship_goals?: string[]
}

export interface RecommendedUser {
  id: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  isOnline: boolean
}