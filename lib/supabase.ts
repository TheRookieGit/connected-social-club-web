import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckhxivbcnagwgpzljzrl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraHhpdmJjbmFnd2dwemxqenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjQwMzgsImV4cCI6MjA2OTEwMDAzOH0.ZxoO8QQ9G3tggQFRCHjdnulgv45KtVyx6B7TnqrdHx4'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 