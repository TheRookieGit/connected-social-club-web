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

// 获取已匹配的用户
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

    console.log('🔍 获取已匹配用户 - 当前用户ID:', decoded.userId)
    
    // 查找双向匹配：
    // 1. 当前用户发起的已接受匹配
    // 2. 其他用户发起且当前用户接受的匹配
    const { data: myInitiatedMatches, error: error1 } = await supabase
      .from('user_matches')
      .select('matched_user_id, match_score, created_at')
      .eq('user_id', decoded.userId)
      .eq('match_status', 'accepted')

    const { data: othersInitiatedMatches, error: error2 } = await supabase
      .from('user_matches')
      .select('user_id, match_score, created_at')
      .eq('matched_user_id', decoded.userId)
      .eq('match_status', 'accepted')

    console.log('🔍 匹配查询结果:')
    console.log('  - 我发起的匹配:', myInitiatedMatches)
    console.log('  - 别人发起的匹配:', othersInitiatedMatches)
    console.log('  - 查询错误:', { error1, error2 })

    if (error1 || error2) {
      console.error('❌ 获取匹配记录错误:', { error1, error2 })
      return NextResponse.json(
        { success: false, error: '获取匹配记录失败' },
        { status: 500 }
      )
    }

    // 合并所有匹配的用户ID
    const matchedUserIds = new Set<number>()
    const matchDetails = new Map<number, any>()

    // 处理我发起的匹配
    if (myInitiatedMatches) {
      myInitiatedMatches.forEach(match => {
        matchedUserIds.add(match.matched_user_id)
        matchDetails.set(match.matched_user_id, {
          match_score: match.match_score,
          created_at: match.created_at,
          initiated_by_me: true
        })
      })
    }

    // 处理别人发起的匹配
    if (othersInitiatedMatches) {
      othersInitiatedMatches.forEach(match => {
        matchedUserIds.add(match.user_id)
        matchDetails.set(match.user_id, {
          match_score: match.match_score,
          created_at: match.created_at,
          initiated_by_me: false
        })
      })
    }

    console.log('🎯 所有匹配的用户ID:', Array.from(matchedUserIds))

    if (matchedUserIds.size === 0) {
      console.log('📭 没有找到已匹配的用户')
      return NextResponse.json({
        success: true,
        matchedUsers: [],
        total: 0
      })
    }

    // 获取匹配用户的详细信息
    const { data: matchedUsersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, birth_date, gender, avatar_url, bio, location, occupation, is_online, last_seen')
      .in('id', Array.from(matchedUserIds))

    if (usersError) {
      console.error('❌ 获取用户信息错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    console.log('👥 获取到的用户数据:', matchedUsersData)

    // 格式化匹配用户数据
    const matchedUsers = matchedUsersData?.map((user: any) => {
      const details = matchDetails.get(user.id)
      
      return {
        id: user.id,
        name: user.name,
        age: calculateAge(user.birth_date),
        gender: user.gender,
        location: user.location || '未知',
        bio: user.bio || '这个人很神秘...',
        occupation: user.occupation,
        avatar_url: user.avatar_url,
        isOnline: user.is_online || false,
        lastSeen: user.last_seen,
        matchScore: Math.round((details?.match_score || 0) * 100),
        matchedAt: details?.created_at,
        initiatedByMe: details?.initiated_by_me || false
      }
    }) || []

    // 按匹配时间排序（最新的在前）
    matchedUsers.sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime())

    console.log('✅ 格式化后的匹配用户:', matchedUsers)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'view_matched_users',
        activity_data: { count: matchedUsers.length }
      })

    return NextResponse.json({
      success: true,
      matchedUsers: matchedUsers,
      total: matchedUsers.length
    })

  } catch (error) {
    console.error('❌ 获取已匹配用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 