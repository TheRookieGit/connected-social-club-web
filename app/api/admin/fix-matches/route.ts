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

// 修复匹配记录状态
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

    const { action, userId1, userId2 } = await request.json()

    if (action === 'clear_all') {
      // 清除所有匹配记录
      const { error: deleteError } = await supabase
        .from('user_matches')
        .delete()
        .neq('id', 0) // 删除所有记录的技巧

      if (deleteError) {
        console.error('清除匹配记录错误:', deleteError)
        return NextResponse.json(
          { success: false, error: '清除匹配记录失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '已清除所有匹配记录'
      })
    }

    if (action === 'create_test_match' && userId1 && userId2) {
      // 先删除现有的匹配记录
      await supabase
        .from('user_matches')
        .delete()
        .or(`and(user_id.eq.${userId1},matched_user_id.eq.${userId2}),and(user_id.eq.${userId2},matched_user_id.eq.${userId1})`)

      // 创建新的双向已接受匹配
      const matchData = [
        {
          user_id: parseInt(userId1),
          matched_user_id: parseInt(userId2),
          match_status: 'accepted',
          match_score: 0.95
        },
        {
          user_id: parseInt(userId2),
          matched_user_id: parseInt(userId1),
          match_status: 'accepted',
          match_score: 0.95
        }
      ]

      const { data: newMatches, error: insertError } = await supabase
        .from('user_matches')
        .insert(matchData)
        .select()

      if (insertError) {
        console.error('创建测试匹配错误:', insertError)
        return NextResponse.json(
          { success: false, error: '创建测试匹配失败: ' + insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `成功创建测试匹配记录`,
        matches: newMatches
      })
    }

    return NextResponse.json(
      { success: false, error: '无效的操作' },
      { status: 400 }
    )

  } catch (error) {
    console.error('修复匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 