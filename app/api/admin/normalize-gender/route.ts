import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

// 禁用静态生成
export const dynamic = 'force-dynamic'

// 验证 JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// 统一性别数据格式
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: '数据库连接失败' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 检查是否为管理员
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', decoded.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    if (currentUser.email !== 'admin@socialclub.com') {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }

    console.log('🔧 [性别标准化API] 开始统一性别数据格式')

    // 获取所有用户的性别数据
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, gender')

    if (fetchError) {
      console.error('❌ [性别标准化API] 获取用户数据失败:', fetchError)
      return NextResponse.json(
        { success: false, error: '获取用户数据失败' },
        { status: 500 }
      )
    }

    console.log('📊 [性别标准化API] 当前性别数据分布:', users?.map(u => ({ id: u.id, gender: u.gender })))

    let updatedCount = 0
    const updateResults = []

    // 批量更新性别数据
    for (const user of users || []) {
      let newGender = user.gender

      // 标准化性别标识
      if (user.gender === 'male' || user.gender === '男') {
        newGender = '男'
      } else if (user.gender === 'female' || user.gender === '女') {
        newGender = '女'
      } else if (user.gender === 'other' || user.gender === '其他') {
        newGender = '其他'
      } else if (user.gender === 'nonbinary' || user.gender === '非二元') {
        newGender = '非二元'
      }

      // 如果性别需要更新
      if (newGender !== user.gender) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ gender: newGender })
          .eq('id', user.id)

        if (updateError) {
          console.error(`❌ [性别标准化API] 更新用户 ${user.id} 性别失败:`, updateError)
          updateResults.push({
            userId: user.id,
            userName: user.name,
            oldGender: user.gender,
            newGender: newGender,
            success: false,
            error: updateError.message
          })
        } else {
          updatedCount++
          updateResults.push({
            userId: user.id,
            userName: user.name,
            oldGender: user.gender,
            newGender: newGender,
            success: true
          })
          console.log(`✅ [性别标准化API] 用户 ${user.name} (${user.id}) 性别从 "${user.gender}" 更新为 "${newGender}"`)
        }
      }
    }

    console.log(`✅ [性别标准化API] 性别标准化完成，更新了 ${updatedCount} 个用户`)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'admin_normalize_gender',
        activity_data: { 
          updated_count: updatedCount,
          total_users: users?.length || 0,
          results: updateResults
        }
      })

    return NextResponse.json({
      success: true,
      message: `性别数据标准化完成，更新了 ${updatedCount} 个用户`,
      data: {
        updatedCount,
        totalUsers: users?.length || 0,
        results: updateResults
      }
    })

  } catch (error) {
    console.error('❌ [性别标准化API] 系统错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 