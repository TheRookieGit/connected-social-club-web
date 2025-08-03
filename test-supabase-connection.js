const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== Supabase连接测试 ===')
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少Supabase环境变量')
  console.log('请确保设置了以下环境变量:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase客户端创建成功')
  
  // 测试查询users表
  console.log('\n=== 测试查询users表 ===')
  supabase
    .from('users')
    .select('*')
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ 查询users表失败:', error)
      } else {
        console.log('✅ users表查询成功')
        console.log('用户数量:', data.length)
        if (data.length > 0) {
          console.log('前5个用户:')
          data.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.name})`)
          })
        } else {
          console.log('⚠️  users表中没有用户数据')
        }
      }
    })
    .catch(error => {
      console.error('❌ 查询过程中出错:', error)
    })
    
} catch (error) {
  console.error('❌ 创建Supabase客户端失败:', error)
} 