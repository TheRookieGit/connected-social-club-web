import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const targetUserId = id

    // 获取目标用户的详细信息
    const { data: userData, error: userError } = await supabase
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
        ethnicity,
        religion,
        employer,
        school,
        degree,
        values_preferences,
        personality_type,
        hometown,
        languages,
        family_plans,
        has_kids,
        marital_status,
        exercise_frequency,
        smoking_status,
        drinking_status,
        dating_style,
        is_online,
        last_seen,
        photos
      `)
      .eq('id', targetUserId)
      .single()

    if (userError) {
      console.error('获取用户数据错误:', userError)
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取用户的兴趣爱好
    const { data: interestsData, error: interestsError } = await supabase
      .from('user_interests')
      .select('interest_id')
      .eq('user_id', targetUserId)

    if (interestsError) {
      console.error('获取用户兴趣错误:', interestsError)
    }

    const interests = interestsData?.map(item => item.interest_id) || []

    // 判断用户是否真的在线（5分钟内活跃）
    const lastSeen = userData.last_seen ? new Date(userData.last_seen) : null
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const isActuallyOnline = lastSeen && lastSeen > fiveMinutesAgo

    // 调试信息
    console.log('API - 用户数据:', {
      id: userData.id,
      name: userData.name,
      avatar_url: userData.avatar_url,
      photos: userData.photos,
      photosType: typeof userData.photos,
      photosLength: userData.photos?.length
    })

    // 格式化用户资料
    const profile = {
      id: userData.id.toString(),
      name: userData.name,
      age: calculateAge(userData.birth_date),
      gender: userData.gender,
      location: userData.location || '未知',
      bio: userData.bio || '这个人很神秘...',
      occupation: userData.occupation,
      education: userData.education,
      relationship_status: userData.relationship_status,
      height: userData.height,
      weight: userData.weight,
      ethnicity: userData.ethnicity,
      religion: userData.religion,
      employer: userData.employer,
      school: userData.school,
      degree: userData.degree,
      values_preferences: userData.values_preferences || [],
      personality_type: userData.personality_type,
      hometown: userData.hometown,
      languages: userData.languages || [],
      family_plans: userData.family_plans,
      has_kids: userData.has_kids,
      marital_status: userData.marital_status,
      exercise_frequency: userData.exercise_frequency,
      smoking_status: userData.smoking_status,
      drinking_status: userData.drinking_status,
      dating_style: userData.dating_style,
      avatar_url: userData.avatar_url,
      photos: userData.photos || [],
      interests: interests,
      isOnline: isActuallyOnline,
      lastSeen: userData.last_seen
    }

    console.log('API - 返回的profile:', {
      id: profile.id,
      name: profile.name,
      avatar_url: profile.avatar_url,
      photos: profile.photos,
      photosLength: profile.photos.length
    })

    return NextResponse.json({
      success: true,
      profile: profile
    })

  } catch (error) {
    console.error('获取用户资料错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 