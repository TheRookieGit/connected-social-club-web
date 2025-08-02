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

// 获取女性用户的已匹配列表
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

    console.log('🔍 [女性匹配API] 用户ID:', decoded.userId)
    
    // 首先验证当前用户是否为女性
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, name, gender')
      .eq('id', decoded.userId)
      .single()

    if (userError) {
      console.error('❌ [女性匹配API] 获取用户信息失败:', userError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    if (!currentUser) {
      console.error('❌ [女性匹配API] 用户不存在')
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查用户性别
    if (currentUser.gender !== '女') {
      console.log(`❌ [女性匹配API] 用户 ${currentUser.name} (${currentUser.gender}) 不是女性，拒绝访问`)
      return NextResponse.json(
        { success: false, error: '此功能仅对女性用户开放' },
        { status: 403 }
      )
    }

    console.log(`✅ [女性匹配API] 用户 ${currentUser.name} 是女性，允许访问`)

    // 查找双向匹配（双方都互相like了）
    // 1. 当前用户发起的已接受匹配
    const { data: myInitiatedMatches, error: error1 } = await supabase
      .from('user_matches')
      .select('matched_user_id, match_score, created_at')
      .eq('user_id', decoded.userId)
      .eq('match_status', 'accepted')

    // 2. 其他用户发起且当前用户接受的匹配
    const { data: othersInitiatedMatches, error: error2 } = await supabase
      .from('user_matches')
      .select('user_id, match_score, created_at')
      .eq('matched_user_id', decoded.userId)
      .eq('match_status', 'accepted')

    console.log('🔍 [女性匹配API] 匹配查询结果:')
    console.log('  - 我发起的匹配:', myInitiatedMatches)
    console.log('  - 别人发起的匹配:', othersInitiatedMatches)
    console.log('  - 查询错误:', { error1, error2 })

    if (error1 || error2) {
      console.error('❌ [女性匹配API] 获取匹配记录错误:', { error1, error2 })
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

    console.log('🎯 [女性匹配API] 所有匹配的用户ID:', Array.from(matchedUserIds))

    if (matchedUserIds.size === 0) {
      console.log('📭 [女性匹配API] 没有找到已匹配的用户')
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
      console.error('❌ [女性匹配API] 获取用户信息错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    console.log('👥 [女性匹配API] 获取到的用户数据:', matchedUsersData)

    // 格式化匹配用户数据
    const matchedUsers = matchedUsersData?.map(user => {
      const details = matchDetails.get(user.id)
      
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
        matchScore: Math.round((details?.match_score || 0) * 100),
        matchedAt: details?.created_at,
        initiatedByMe: details?.initiated_by_me || false
      }
    }) || []

    // 按匹配时间排序（最新的在前）
    matchedUsers.sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime())

    console.log('✅ [女性匹配API] 格式化后的匹配用户:', matchedUsers)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'view_matched_for_female',
        activity_data: { count: matchedUsers.length }
      })

    return NextResponse.json({
      success: true,
      matchedUsers: matchedUsers,
      total: matchedUsers.length
    })

  } catch (error) {
    console.error('❌ [女性匹配API] 获取已匹配用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 