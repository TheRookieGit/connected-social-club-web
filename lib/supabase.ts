import { createClient } from '@supabase/supabase-js'

// 使用环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// 为API路由提供的统一客户端创建函数
export function createSupabaseClient() {
  try {
    console.log('创建Supabase客户端...')
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
    
    const client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false // API路由不需要持久化会话
      }
    })
    
    console.log('Supabase客户端创建成功')
    return client
  } catch (error) {
    console.error('Supabase客户端创建失败:', error)
    throw new Error('无法创建Supabase客户端')
  }
} 