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

// 计算用户年龄
function calculateAge(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// 获取用户like过的用户列表（对所有用户开放）
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

    console.log('🔍 [喜欢列表API] 用户ID:', decoded.userId)
    
    // 获取当前用户信息（用于显示用户信息，不再限制性别）
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, name, gender')
      .eq('id', decoded.userId)
      .single()

    if (userError) {
      console.error('❌ [喜欢列表API] 获取用户信息失败:', userError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    if (!currentUser) {
      console.error('❌ [喜欢列表API] 用户不存在')
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    console.log(`✅ [喜欢列表API] 用户 ${currentUser.name} (${currentUser.gender}) 访问喜欢列表`)

    // 获取当前用户like过的所有用户（包括pending和accepted状态）
    const { data: likedUsers, error: likedError } = await supabase
      .from('user_matches')
      .select('matched_user_id, match_status, match_score, created_at')
      .eq('user_id', decoded.userId)
      .in('match_status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })

    console.log('🔍 [喜欢列表API] 喜欢查询结果:', { likedUsers, likedError })

    if (likedError) {
      console.error('❌ [喜欢列表API] 获取喜欢记录错误:', likedError)
      return NextResponse.json(
        { success: false, error: '获取喜欢记录失败' },
        { status: 500 }
      )
    }

    if (!likedUsers || likedUsers.length === 0) {
      console.log('📭 [喜欢列表API] 没有找到喜欢过的用户')
      return NextResponse.json({
        success: true,
        likedUsers: [],
        total: 0
      })
    }

    // 获取被喜欢用户的详细信息
    const likedUserIds = likedUsers.map(match => match.matched_user_id)
    const { data: likedUsersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, birth_date, gender, avatar_url, bio, location, occupation, is_online, last_seen')
      .in('id', likedUserIds)

    if (usersError) {
      console.error('❌ [喜欢列表API] 获取用户信息错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    console.log('👥 [喜欢列表API] 获取到的用户数据:', likedUsersData)

    // 格式化用户数据，包含匹配状态
    const formattedUsers = likedUsersData?.map(user => {
      const matchInfo = likedUsers.find(match => match.matched_user_id === user.id)
      
      // 判断用户是否真的在线（5分钟内活跃）
      const lastSeen = user.last_seen ? new Date(user.last_seen) : null
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      const isActuallyOnline = lastSeen && lastSeen > fiveMinutesAgo
      
      return {
        id: user.id,
        name: user.name,
        age: calculateAge(user.birth_date),
        gender: user.gender,
        location: user.location || '未知',
        bio: user.bio || '这个人很神秘...',
        occupation: user.occupation,
        avatar_url: user.avatar_url,
        isOnline: isActuallyOnline,
        lastSeen: user.last_seen,
        matchScore: Math.round((matchInfo?.match_score || 0) * 100),
        likedAt: matchInfo?.created_at,
        matchStatus: matchInfo?.match_status || 'pending',
        // 根据用户性别决定是否可以开始对话
        canStartChat: currentUser.gender === '女' || currentUser.gender === 'female',
        hasReceivedMessage: false // 这个状态需要通过消息查询来确定
      }
    }) || []

    // 按喜欢时间排序（最新的在前）
    formattedUsers.sort((a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime())

    console.log('✅ [喜欢列表API] 格式化后的用户:', formattedUsers)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'view_liked_users',
        activity_data: { count: formattedUsers.length }
      })

    return NextResponse.json({
      success: true,
      likedUsers: formattedUsers,
      total: formattedUsers.length
    })

  } catch (error) {
    console.error('❌ [喜欢列表API] 获取喜欢用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 