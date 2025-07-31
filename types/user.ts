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
  photos?: string[]
  is_online?: boolean
  is_verified?: boolean
  is_premium?: boolean
  status?: string
  created_at?: string
  updated_at?: string
  preferences?: any
  
  // 新增字段 - 基础信息
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

export interface UserProfile extends User {
  interests: string[]
  preferences: any | null
  // 扩展资料信息
  education_history?: UserEducation[]
  work_experience?: UserWorkExperience[]
  language_skills?: UserLanguage[]
  personal_values?: UserValue[]
  lifestyle?: UserLifestyle
  relationship_preferences?: UserRelationshipPreferences
}

// 教育经历
export interface UserEducation {
  id: number
  user_id: number
  school: string
  degree?: string
  field_of_study?: string
  graduation_year?: number
  is_current: boolean
  created_at: string
  updated_at: string
}

// 工作经历
export interface UserWorkExperience {
  id: number
  user_id: number
  employer: string
  position?: string
  industry?: string
  start_date?: string
  end_date?: string
  is_current: boolean
  description?: string
  created_at: string
  updated_at: string
}

// 语言能力
export interface UserLanguage {
  id: number
  user_id: number
  language: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'
  created_at: string
}

// 个人价值观
export interface UserValue {
  id: number
  user_id: number
  value_name: string
  importance_level: number // 1-5 scale
  created_at: string
}

// 生活方式
export interface UserLifestyle {
  id: number
  user_id: number
  exercise_frequency?: string
  smoking_status?: string
  drinking_status?: string
  diet_preferences?: string[]
  sleep_schedule?: string
  social_media_usage?: string
  created_at: string
  updated_at: string
}

// 关系偏好
export interface UserRelationshipPreferences {
  id: number
  user_id: number
  dating_style?: string
  family_plans?: string
  relationship_goals?: string[]
  deal_breakers?: string[]
  must_haves?: string[]
  created_at: string
  updated_at: string
}

// 资料填写选项
export interface ProfileOptions {
  ethnicities: string[]
  religions: string[]
  personality_types: string[]
  smoking_statuses: string[]
  drinking_statuses: string[]
  dating_styles: string[]
  family_plans: string[]
  relationship_statuses: string[]
  languages: string[]
  values: string[]
  interests: string[]
}
