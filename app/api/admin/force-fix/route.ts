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

// 检查是否是管理员用户
async function isAdmin(userId: number, supabase: any) {
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()
  
  const adminEmails = ['admin@socialclub.com']
  return user && adminEmails.includes(user.email)
}

// 强力修复匹配系统
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

    // 检查管理员权限
    const hasAdminPermission = await isAdmin(decoded.userId, supabase)
    if (!hasAdminPermission) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }

    console.log('🔧 开始强力修复匹配系统...')

    // 步骤1：清除所有现有匹配记录
    const { error: deleteError } = await supabase
      .from('user_matches')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      console.error('清除匹配记录失败:', deleteError)
      return NextResponse.json(
        { success: false, error: '清除旧记录失败: ' + deleteError.message },
        { status: 500 }
      )
    }

    console.log('✅ 已清除所有旧的匹配记录')

    // 步骤2：智能获取用户 - 先找管理员，再找其他用户
    let adminUser = null
    let otherUser = null

    // 首先专门查找管理员用户
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', 'admin@socialclub.com')
      .eq('status', 'active')
      .limit(1)

    if (adminUsers && adminUsers.length > 0) {
      adminUser = adminUsers[0]
      console.log('✅ 找到管理员用户:', adminUser.name)
    } else {
      // 如果没有找到管理员，使用当前登录的用户作为第一个用户
      const { data: currentUser, error: currentUserError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', decoded.userId)
        .single()

      if (currentUser) {
        adminUser = currentUser
        console.log('📝 使用当前用户作为第一个用户:', adminUser.name)
      }
    }

    // 然后查找其他用户
    const { data: otherUsers, error: otherError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('status', 'active')
      .neq('id', adminUser?.id || -1)
      .limit(1)

    if (otherUsers && otherUsers.length > 0) {
      otherUser = otherUsers[0]
      console.log('✅ 找到其他用户:', otherUser.name)
    }

    console.log('📋 最终选择的用户:', {
      user1: adminUser?.name || 'None',
      user2: otherUser?.name || 'None'
    })

    if (!adminUser || !otherUser) {
      return NextResponse.json(
        { success: false, error: `找不到足够的用户。管理员: ${adminUser?.name || '无'}, 其他用户: ${otherUser?.name || '无'}` },
        { status: 400 }
      )
    }

    // 步骤4：直接插入accepted状态的匹配记录
    const matchRecords = [
      {
        user_id: adminUser.id,
        matched_user_id: otherUser.id,
        match_status: 'accepted',
        match_score: 0.95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: otherUser.id,
        matched_user_id: adminUser.id,
        match_status: 'accepted',
        match_score: 0.95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    console.log('📝 准备插入匹配记录:', matchRecords)

    const { data: insertedMatches, error: insertError } = await supabase
      .from('user_matches')
      .insert(matchRecords)
      .select()

    if (insertError) {
      console.error('插入匹配记录失败:', insertError)
      return NextResponse.json(
        { success: false, error: '插入匹配记录失败: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ 成功插入匹配记录:', insertedMatches)

    // 步骤5：验证插入结果
    const { data: verifyMatches, error: verifyError } = await supabase
      .from('user_matches')
      .select('*')
      .eq('match_status', 'accepted')

    console.log('🔍 验证结果:', { verifyMatches, verifyError })

    return NextResponse.json({
      success: true,
      message: `强力修复完成！成功创建 ${adminUser.name} 和 ${otherUser.name} 的匹配`,
      data: {
        clearedOldRecords: true,
        insertedMatches: insertedMatches?.length || 0,
        verificationCount: verifyMatches?.length || 0,
        matchedUsers: [adminUser.name, otherUser.name]
      }
    })

  } catch (error) {
    console.error('强力修复失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 