import { createClient } from '@supabase/supabase-js'

// 使用环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_anon_key_here'

// 只在运行时检查环境变量
if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Missing Supabase environment variables - using fallback values')
}

// 在构建时避免创建客户端
let supabase: any = null
if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
  }
}

export { supabase }

// 为API路由提供的统一客户端创建函数
export function createSupabaseClient() {
  // 在构建时返回null，避免构建错误
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null
  }
  
  try {
    console.log('创建Supabase客户端...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
    
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // API路由不需要持久化会话
      }
    })
    
    console.log('Supabase客户端创建成功')
    return client
  } catch (error) {
    console.error('Supabase客户端创建失败:', error)
    return null
  }
} 