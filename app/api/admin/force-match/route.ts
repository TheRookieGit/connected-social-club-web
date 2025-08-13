import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

// 禁用静态生成
export const dynamic = 'force-dynamic'

// 验证 JWT token 和管理员权限
function verifyAdminToken(authHeader: string | null) {
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
  
  // 简单的管理员检查 - 可以根据需要扩展
  const adminEmails = ['admin@socialclub.com']
  return user && adminEmails.includes(user.email)
}

// 强制匹配两个用户
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
    const decoded = verifyAdminToken(authHeader)
    
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

    const { userId1, userId2, matchScore = 0.95 } = await request.json()

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    if (userId1 === userId2) {
      return NextResponse.json(
        { success: false, error: '不能匹配同一个用户' },
        { status: 400 }
      )
    }

    // 验证两个用户是否存在
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', [userId1, userId2])

    if (usersError || !users || users.length !== 2) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查是否已经存在匹配关系
    const { data: existingMatches } = await supabase
      .from('user_matches')
      .select('*')
      .or(`and(user_id.eq.${userId1},matched_user_id.eq.${userId2}),and(user_id.eq.${userId2},matched_user_id.eq.${userId1})`)

    if (existingMatches && existingMatches.length > 0) {
      return NextResponse.json(
        { success: false, error: '用户之间已存在匹配关系' },
        { status: 400 }
      )
    }

    // 创建双向匹配记录
    const matchData = [
      {
        user_id: userId1,
        matched_user_id: userId2,
        match_status: 'accepted',
        match_score: matchScore
      },
      {
        user_id: userId2,
        matched_user_id: userId1,
        match_status: 'accepted',
        match_score: matchScore
      }
    ]

    const { data: newMatches, error: matchError } = await supabase
      .from('user_matches')
      .insert(matchData)
      .select()

    if (matchError) {
      console.error('创建匹配错误:', matchError)
      return NextResponse.json(
        { success: false, error: '创建匹配失败' },
        { status: 500 }
      )
    }

    // 记录管理员操作日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'admin_force_match',
        activity_data: {
          matched_users: [userId1, userId2],
          match_score: matchScore,
          admin_action: true
        }
      })

    const user1 = users.find(u => u.id == userId1)
    const user2 = users.find(u => u.id == userId2)

    return NextResponse.json({
      success: true,
      message: `成功强制匹配用户 ${user1?.name} 和 ${user2?.name}`,
      matches: newMatches,
      users: users
    })

  } catch (error) {
    console.error('强制匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取所有用户列表（供管理员选择）
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: '数据库连接失败' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization')
    const decoded = verifyAdminToken(authHeader)
    
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

    // 获取所有活跃用户
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, gender, location, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('获取用户列表错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取用户列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || []
    })

  } catch (error) {
    console.error('获取用户列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 