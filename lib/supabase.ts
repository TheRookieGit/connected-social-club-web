import { createClient } from '@supabase/supabase-js'

// 强制使用硬编码配置，避免生产环境URL问题
const supabaseUrl = 'https://ckhxivbcnagwgpzljzrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraHhpdmJjbmFnd2dwemxqenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjQwMzgsImV4cCI6MjA2OTEwMDAzOH0.ZxoO8QQ9G3tggQFRCHjdnulgv45KtVyx6B7TnqrdHx4'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 为API路由提供的统一客户端创建函数
export function createSupabaseClient() {
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