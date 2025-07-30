import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

// 验证JWT令牌
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// 搜索用户
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
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    console.log(`🔍 搜索用户: "${query}"`)

    // 获取已匹配的用户ID列表
    const { data: existingMatches } = await supabase
      .from('user_matches')
      .select('matched_user_id')
      .eq('user_id', decoded.userId)

    const { data: existingMatchesToMe } = await supabase
      .from('user_matches')
      .select('user_id')
      .eq('matched_user_id', decoded.userId)

    const matchedUserIds = new Set([
      ...(existingMatches?.map((m: any) => m.matched_user_id) || []),
      ...(existingMatchesToMe?.map((m: any) => m.user_id) || [])
    ])

    // 搜索用户（按姓名和邮箱）
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, bio, location, is_online, last_seen')
      .eq('status', 'active')
      .not('id', 'eq', decoded.userId) // 排除自己
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit)

    if (usersError) {
      console.error('❌ 搜索用户错误:', usersError)
      return NextResponse.json(
        { success: false, error: '搜索失败' },
        { status: 500 }
      )
    }

    // 标记已匹配的用户
    const usersWithMatchStatus = (users || []).map(user => ({
      ...user,
      isMatched: matchedUserIds.has(user.id),
      canStartChat: matchedUserIds.has(user.id) // 只有已匹配的用户可以开始聊天
    }))

    console.log(`✅ 搜索到 ${usersWithMatchStatus.length} 个用户`)

    return NextResponse.json({
      success: true,
      users: usersWithMatchStatus
    })

  } catch (error) {
    console.error('搜索用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
