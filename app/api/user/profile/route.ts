import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

// 禁用静态生成
export const dynamic = 'force-dynamic'

// 创建 Supabase 客户端的函数
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckhxivbcnagwgpzljzrl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraHhpdmJjbmFnd2dwemxqenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjQwMzgsImV4cCI6MjA2OTEwMDAzOH0.ZxoO8QQ9G3tggQFRCHjdnulgv45KtVyx6B7TnqrdHx4'

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Supabase client creation failed:', error)
    return null
  }
}

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

// 获取用户资料
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

    // 获取用户资料
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        phone,
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
        status,
        created_at,
        updated_at
      `)
      .eq('id', decoded.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取用户兴趣
    const { data: interests, error: interestsError } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', decoded.userId)

    // 获取用户偏好
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', decoded.userId)
      .single()

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'profile_view',
        activity_data: { profile_id: decoded.userId }
      })

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        interests: interests?.map((i: any) => i.interest) || [],
        preferences: preferences || null
      }
    })

  } catch (error) {
    console.error('获取用户资料错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新用户资料
export async function PUT(request: NextRequest) {
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

    const updateData = await request.json()
    
    // 允许更新的字段
    const allowedFields = [
      'name', 'phone', 'birth_date', 'gender', 'avatar_url', 'bio',
      'location', 'occupation', 'education', 'relationship_status',
      'height', 'weight'
    ]
    
    const filteredData: any = {}
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    })

    // 更新用户资料
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(filteredData)
      .eq('id', decoded.userId)
      .select()
      .single()

    if (updateError) {
      console.error('更新用户资料错误:', updateError)
      return NextResponse.json(
        { success: false, error: '更新失败' },
        { status: 500 }
      )
    }

    // 更新兴趣（如果提供）
    if (updateData.interests && Array.isArray(updateData.interests)) {
      // 删除现有兴趣
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', decoded.userId)

      // 插入新兴趣
      if (updateData.interests.length > 0) {
        const interestsData = updateData.interests.map((interest: string) => ({
          user_id: decoded.userId,
          interest: interest.trim()
        }))

        await supabase
          .from('user_interests')
          .insert(interestsData)
      }
    }

    // 更新偏好（如果提供）
    if (updateData.preferences) {
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: decoded.userId,
          ...updateData.preferences
        })

      if (prefError) {
        console.error('更新用户偏好错误:', prefError)
      }
    }

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'profile_update',
        activity_data: { updated_fields: Object.keys(filteredData) }
      })

    return NextResponse.json({
      success: true,
      message: '资料更新成功',
      user: updatedUser
    })

  } catch (error) {
    console.error('更新用户资料错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 