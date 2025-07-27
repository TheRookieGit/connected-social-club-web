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

// 计算匹配分数
function calculateMatchScore(user1: any, user2: any, user1Interests: string[], user2Interests: string[]) {
  let score = 0
  
  // 年龄匹配 (20%)
  const age1 = calculateAge(user1.birth_date)
  const age2 = calculateAge(user2.birth_date)
  const ageDiff = Math.abs(age1 - age2)
  if (ageDiff <= 5) score += 20
  else if (ageDiff <= 10) score += 10
  else if (ageDiff <= 15) score += 5
  
  // 兴趣匹配 (40%)
  const commonInterests = user1Interests.filter(interest => 
    user2Interests.includes(interest)
  )
  const interestScore = (commonInterests.length / Math.max(user1Interests.length, user2Interests.length)) * 40
  score += interestScore
  
  // 地理位置匹配 (20%)
  if (user1.location === user2.location) score += 20
  else if (user1.location && user2.location) {
    // 简单的地理位置匹配逻辑
    const locations = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安']
    const location1 = locations.find(loc => user1.location.includes(loc))
    const location2 = locations.find(loc => user2.location.includes(loc))
    if (location1 === location2) score += 15
  }
  
  // 职业匹配 (20%)
  if (user1.occupation && user2.occupation) {
    const techJobs = ['工程师', '程序员', '开发', '技术', '软件', 'IT']
    const isTech1 = techJobs.some(job => user1.occupation.includes(job))
    const isTech2 = techJobs.some(job => user2.occupation.includes(job))
    if (isTech1 === isTech2) score += 20
  }
  
  return Math.min(score, 100) / 100 // 返回 0-1 之间的分数
}

// 获取推荐用户
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 获取当前用户信息
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取当前用户的兴趣
    const { data: currentUserInterests } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', decoded.userId)

    const currentUserInterestList = currentUserInterests?.map((i: any) => i.interest) || []

    // 获取已匹配的用户ID
    const { data: existingMatches } = await supabase
      .from('user_matches')
      .select('matched_user_id')
      .eq('user_id', decoded.userId)

    const matchedUserIds = existingMatches?.map((m: any) => m.matched_user_id) || []

    // 获取推荐用户（排除自己和已匹配的用户）
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        birth_date,
        gender,
        avatar_url,
        bio,
        location,
        occupation,
        education,
        relationship_status,
        height,
        weight,
        is_online,
        last_seen,
        is_verified,
        is_premium,
        created_at
      `)
      .neq('id', decoded.userId)
      .eq('status', 'active')
      .limit(limit)

    if (matchedUserIds.length > 0) {
      query = query.not('id', 'in', `(${matchedUserIds.join(',')})`)
    }

    const { data: recommendedUsers, error: usersError } = await query

    if (usersError) {
      console.error('获取推荐用户错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取推荐用户失败' },
        { status: 500 }
      )
    }

    // 为每个推荐用户获取兴趣并计算匹配分数
    const usersWithScores = await Promise.all(
      recommendedUsers?.map(async (user: any) => {
        // 获取用户兴趣
        const { data: userInterests } = await supabase
          .from('user_interests')
          .select('interest')
          .eq('user_id', user.id)

        const userInterestList = userInterests?.map((i: any) => i.interest) || []
        
        // 计算匹配分数
        const matchScore = calculateMatchScore(currentUser, user, currentUserInterestList, userInterestList)
        
        return {
          ...user,
          interests: userInterestList,
          matchScore: Math.round(matchScore * 100) // 转换为百分比
        }
      }) || []
    )

    // 按匹配分数排序
    usersWithScores.sort((a, b) => b.matchScore - a.matchScore)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'view_recommendations',
        activity_data: { count: usersWithScores.length }
      })

    return NextResponse.json({
      success: true,
      users: usersWithScores,
      total: usersWithScores.length,
      hasMore: usersWithScores.length === limit
    })

  } catch (error) {
    console.error('获取推荐用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建匹配
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

    const { matchedUserId, action } = await request.json() // action: 'like', 'pass', 'super_like'

    if (!matchedUserId || !action) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      )
    }

    // 检查是否已经存在匹配
    const { data: existingMatch } = await supabase
      .from('user_matches')
      .select('*')
      .eq('user_id', decoded.userId)
      .eq('matched_user_id', matchedUserId)
      .single()

    if (existingMatch) {
      return NextResponse.json(
        { success: false, error: '已经对该用户进行过操作' },
        { status: 400 }
      )
    }

    // 创建匹配记录
    const { data: newMatch, error: matchError } = await supabase
      .from('user_matches')
      .insert({
        user_id: decoded.userId,
        matched_user_id: matchedUserId,
        match_status: action === 'like' ? 'pending' : 'rejected',
        match_score: 0.5 // 默认分数
      })
      .select()
      .single()

    if (matchError) {
      console.error('创建匹配错误:', matchError)
      return NextResponse.json(
        { success: false, error: '创建匹配失败' },
        { status: 500 }
      )
    }

    // 检查是否形成双向匹配
    let isMatch = false
    if (action === 'like') {
      const { data: reverseMatch } = await supabase
        .from('user_matches')
        .select('*')
        .eq('user_id', matchedUserId)
        .eq('matched_user_id', decoded.userId)
        .eq('match_status', 'pending')
        .single()

      if (reverseMatch) {
        // 更新两个匹配记录为已接受
        await supabase
          .from('user_matches')
          .update({ match_status: 'accepted' })
          .eq('id', newMatch.id)

        await supabase
          .from('user_matches')
          .update({ match_status: 'accepted' })
          .eq('id', reverseMatch.id)

        isMatch = true
      }
    }

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'user_action',
        activity_data: { 
          action, 
          target_user_id: matchedUserId,
          is_match: isMatch 
        }
      })

    return NextResponse.json({
      success: true,
      message: isMatch ? '匹配成功！' : '操作完成',
      isMatch,
      match: newMatch
    })

  } catch (error) {
    console.error('创建匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 