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

    // 获取当前用户的约会偏好
    const { data: currentUserPreferences } = await supabase
      .from('user_preferences')
      .select('preferred_gender')
      .eq('user_id', decoded.userId)
      .single()

    const preferredGenders = currentUserPreferences?.preferred_gender || []
    console.log(`🎯 用户 ${decoded.userId} 的约会偏好:`, preferredGenders)

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
        latitude,
        longitude,
        occupation,
        education,
        relationship_status,
        height,
        weight,
        is_online,
        last_seen,
        is_verified,
        is_premium,
        created_at,
        ethnicity,
        religion,
        employer,
        school,
        degree,
        values_preferences,
        personality_type,
        languages,
        family_plans,
        has_kids,
        smoking_status,
        drinking_status,
        dating_style,
        photos
      `)
      .neq('id', decoded.userId)
      .eq('status', 'active')

    // 强制异性推荐（男只看女，女只看男）；若性别未知则回退到偏好
    const normalizedGender = String(currentUser.gender || '').toLowerCase()
    let enforcedTargetGender: string | null = null
    if (normalizedGender === 'male' || normalizedGender === 'm' || normalizedGender === '男' || normalizedGender === '男性') {
      enforcedTargetGender = 'female'
    } else if (normalizedGender === 'female' || normalizedGender === 'f' || normalizedGender === '女' || normalizedGender === '女性') {
      enforcedTargetGender = 'male'
    }

    if (enforcedTargetGender) {
      console.log(`🎯 强制异性过滤: 当前性别=${normalizedGender} → 目标性别=${enforcedTargetGender}`)
      query = query.eq('gender', enforcedTargetGender)
    } else {
      // 回退：使用用户偏好
      if (preferredGenders.length > 0) {
        if (preferredGenders.includes('everyone')) {
          console.log('🎯 用户选择约会所有人，不进行性别过滤')
        } else {
          console.log(`🎯 根据用户偏好过滤性别: ${preferredGenders.join(', ')}`)
          query = query.in('gender', preferredGenders)
        }
      } else {
        console.log('🎯 用户未设置约会偏好，推荐所有性别')
      }
    }

    // 添加分页限制
    query = query.limit(limit)

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

    // 为每个推荐用户获取兴趣并计算匹配分数与距离
    const usersWithScores = await Promise.all(
      recommendedUsers?.map(async (user: any) => {
        // 获取用户兴趣
        const { data: userInterests } = await supabase
          .from('user_interests')
          .select('interest')
          .eq('user_id', user.id)

        const userInterestList = userInterests?.map((i: any) => i.interest) || []
        
        // 获取推荐用户的约会偏好
        const { data: userPreferences } = await supabase
          .from('user_preferences')
          .select('preferred_gender')
          .eq('user_id', user.id)
          .single()

        const userPreferredGenders = userPreferences?.preferred_gender || []
        
        // 检查双向匹配：当前用户是否符合推荐用户的偏好
        let isMutualMatch = true
        if (userPreferredGenders.length > 0 && !userPreferredGenders.includes('everyone')) {
          // 如果推荐用户有具体偏好且不是"约会所有人"
          if (!userPreferredGenders.includes(currentUser.gender)) {
            isMutualMatch = false
            console.log(`❌ 用户 ${user.id} 不匹配当前用户 ${decoded.userId} 的性别偏好`)
          }
        }
        
        // 获取用户关系偏好（关系目标）
        const { data: userRelationshipPrefs } = await supabase
          .from('user_relationship_preferences')
          .select('relationship_goals')
          .eq('user_id', user.id)
          .single()

        const relationshipGoals = userRelationshipPrefs?.relationship_goals || []
        
        // 计算匹配分数
        const matchScore = calculateMatchScore(currentUser, user, currentUserInterestList, userInterestList)
        
        // 如果不是双向匹配，降低匹配分数
        const finalMatchScore = isMutualMatch ? matchScore : matchScore * 0.3

        // 计算距离（如有经纬度）
        let distance: number | null = null
        let distance_formatted: string | null = null
        const hasCurrentUserLocation = typeof currentUser.latitude === 'number' && typeof currentUser.longitude === 'number'
        const hasUserLocation = typeof user.latitude === 'number' && typeof user.longitude === 'number'
        if (hasCurrentUserLocation && hasUserLocation) {
          const R = 6371 // km
          const dLat = (user.latitude - currentUser.latitude) * Math.PI / 180
          const dLon = (user.longitude - currentUser.longitude) * Math.PI / 180
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((currentUser.latitude as number) * Math.PI / 180) * Math.cos((user.latitude as number) * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          distance = R * c
          distance_formatted = distance < 1
            ? `${Math.round(distance * 1000)} 米`
            : `${distance.toFixed(1)} 公里`
        }
        
        return {
          ...user,
          interests: userInterestList,
          relationship_goals: relationshipGoals,
          matchScore: Math.round(finalMatchScore * 100), // 转换为百分比
          isMutualMatch: isMutualMatch,
          distance,
          distance_formatted
        }
      }) || []
    )

    // 优先按距离排序（距离近在前），再按匹配分
    const hasLocation = typeof currentUser.latitude === 'number' && typeof currentUser.longitude === 'number'
    if (hasLocation) {
      usersWithScores.sort((a, b) => {
        const ad = typeof a.distance === 'number' ? a.distance as number : Number.POSITIVE_INFINITY
        const bd = typeof b.distance === 'number' ? b.distance as number : Number.POSITIVE_INFINITY
        if (ad !== bd) return ad - bd
        return (b.matchScore || 0) - (a.matchScore || 0)
      })
    } else {
      usersWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    }

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

    console.log(`🎯 用户 ${decoded.userId} 对用户 ${matchedUserId} 执行操作: ${action}`)

    // 检查是否已经存在匹配
    const { data: existingMatch } = await supabase
      .from('user_matches')
      .select('*')
      .eq('user_id', decoded.userId)
      .eq('matched_user_id', matchedUserId)
      .single()

    if (existingMatch) {
      console.log(`❌ 用户 ${decoded.userId} 已经对用户 ${matchedUserId} 进行过操作:`, existingMatch)
      return NextResponse.json(
        { success: false, error: '已经对该用户进行过操作' },
        { status: 400 }
      )
    }

    // 创建匹配记录
    const matchRecord = {
      user_id: decoded.userId,
      matched_user_id: matchedUserId,
      match_status: action === 'like' || action === 'super_like' ? 'pending' : 'rejected',
      match_score: action === 'super_like' ? 0.9 : 0.5 // 超级喜欢给更高分数
    }

    console.log(`📝 正在创建匹配记录:`, matchRecord)

    const { data: newMatch, error: matchError } = await supabase
      .from('user_matches')
      .insert(matchRecord)
      .select()
      .single()

    if (matchError) {
      console.error('❌ 创建匹配错误:', matchError)
      return NextResponse.json(
        { success: false, error: '创建匹配失败: ' + matchError.message },
        { status: 500 }
      )
    }

    console.log(`✅ 成功创建匹配记录:`, newMatch)

    // 检查是否形成双向匹配
    let isMatch = false
    if (action === 'like' || action === 'super_like') {
      console.log(`🔍 检查是否存在反向匹配 (用户 ${matchedUserId} 是否喜欢用户 ${decoded.userId})`)
      
      const { data: reverseMatch } = await supabase
        .from('user_matches')
        .select('*')
        .eq('user_id', matchedUserId)
        .eq('matched_user_id', decoded.userId)
        .eq('match_status', 'pending')
        .single()

      console.log(`🔍 反向匹配查询结果:`, reverseMatch)

      if (reverseMatch) {
        console.log(`🎉 发现双向匹配！正在更新状态为 accepted`)
        
        // 更新两个匹配记录为已接受
        const { error: updateError1 } = await supabase
          .from('user_matches')
          .update({ match_status: 'accepted' })
          .eq('id', newMatch.id)

        const { error: updateError2 } = await supabase
          .from('user_matches')
          .update({ match_status: 'accepted' })
          .eq('id', reverseMatch.id)

        if (updateError1 || updateError2) {
          console.error('❌ 更新匹配状态错误:', { updateError1, updateError2 })
        } else {
          console.log(`✅ 成功更新双向匹配状态为 accepted`)
          isMatch = true
        }
      } else {
        console.log(`📋 没有找到反向匹配，匹配状态保持为 pending`)
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
          is_match: isMatch,
          match_id: newMatch.id
        }
      })

    const responseMessage = isMatch ? 
      `🎉 匹配成功！你和用户 ${matchedUserId} 互相喜欢！` : 
      `📝 操作完成，已向用户 ${matchedUserId} 发送${action === 'super_like' ? '超级' : ''}喜欢请求`

    console.log(`📤 返回响应:`, { success: true, message: responseMessage, isMatch })

    return NextResponse.json({
      success: true,
      message: responseMessage,
      isMatch,
      match: newMatch,
      pendingMatch: !isMatch ? {
        id: newMatch.id,
        status: newMatch.match_status,
        target_user_id: matchedUserId
      } : null
    })

  } catch (error) {
    console.error('❌ 创建匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 