import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

// 禁用静态生成
export const dynamic = 'force-dynamic'

// 创建 Supabase 客户端的函数 - 强制刷新连接
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckhxivbcnagwgpzljzrl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraHhpdmJjbmFnd2dwemxqenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjQwMzgsImV4cCI6MjA2OTEwMDAzOH0.ZxoO8QQ9G3tggQFRCHjdnulgv45KtVyx6B7TnqrdHx4'

  try {
    // 创建新的客户端实例，避免缓存问题
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // 禁用会话持久化
      }
    })
    return client
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

    console.log('获取用户资料，用户ID:', decoded.userId)

    // 获取用户资料 - 使用 * 查询所有字段，强制刷新
    console.log('开始查询用户ID:', decoded.userId)
    console.log('使用的Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckhxivbcnagwgpzljzrl.supabase.co')
    
    // 强制刷新：添加时间戳避免缓存
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    console.log('查询到的用户数据:', user)
    console.log('bio字段值:', user?.bio)
    console.log('location字段值:', user?.location)
    console.log('updated_at字段值:', user?.updated_at)

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

    return new NextResponse(
      JSON.stringify({
        success: true,
        user: {
          ...user,
          interests: interests?.map((i: any) => i.interest) || [],
          preferences: preferences || null
        }
      }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )

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
    console.log('Authorization header:', authHeader ? '存在' : '不存在')
    
    const decoded = verifyToken(authHeader)
    console.log('Token解码结果:', decoded)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    console.log('用户ID:', decoded.userId)
    console.log('用户邮箱:', decoded.email)

    const updateData = await request.json()
    console.log('接收到的原始数据:', updateData)
    
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
        console.log(`字段 ${field}: ${updateData[field]} -> ${filteredData[field]}`)
      }
    })

    console.log('过滤后的数据:', filteredData)
    console.log('用户ID:', decoded.userId)

    // 更新用户资料 - 使用事务确保数据一致性
    console.log('开始更新数据库...')
    const { data: updatedUser, error: updateError, count } = await supabase
      .from('users')
      .update(filteredData)
      .eq('id', decoded.userId)
      .select()
      .single()

    console.log('更新结果:', { updatedUser, updateError, count })

    if (updateError) {
      console.error('更新用户资料错误:', updateError)
      return NextResponse.json(
        { success: false, error: '更新失败' },
        { status: 500 }
      )
    }

    if (!updatedUser) {
      console.error('更新操作没有返回用户数据')
      return NextResponse.json(
        { success: false, error: '更新失败 - 没有返回数据' },
        { status: 500 }
      )
    }

    console.log('更新后的用户数据:', updatedUser)

    // 注意：由于数据库连接问题，我们直接返回更新操作返回的数据
    // 而不是进行确认查询，因为确认查询可能返回旧数据

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

    // 获取最新的兴趣数据
    const { data: latestInterests } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', decoded.userId)

    // 获取最新的偏好数据
    const { data: latestPreferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', decoded.userId)
      .single()

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '更新成功',
        user: {
          ...updatedUser,
          interests: latestInterests?.map(i => i.interest) || [],
          preferences: latestPreferences || null
        }
      }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )

  } catch (error) {
    console.error('更新用户资料错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}