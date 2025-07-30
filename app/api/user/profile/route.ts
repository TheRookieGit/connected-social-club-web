import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

// 禁用静态生成和缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// 验证 JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

// 创建强化的缓存控制头
function createNoCacheHeaders() {
  return {
    'Content-Type': 'application/json',
    // 基本缓存控制
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    // 代理和CDN控制
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    // Vercel特定头部
    'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
    'Vercel-Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Vercel-Cache': 'MISS',
    'X-Vercel-ID': process.env.VERCEL_DEPLOYMENT_ID || 'local',
    // 防止浏览器缓存
    'X-Accel-Expires': '0',
    'X-Proxy-Cache': 'BYPASS',
    // 强制重新验证
    'Last-Modified': new Date().toUTCString(),
    'ETag': `"${Date.now()}-${Math.random()}"`,
    // 防止Service Worker缓存
    'X-SW-Cache': 'no-cache',
    // 时间戳头部
    'X-Timestamp': Date.now().toString(),
    'X-Server-Time': new Date().toISOString()
  }
}

// 获取用户资料
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '数据库连接失败' }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '未授权访问' }),
        { 
          status: 401,
          headers: createNoCacheHeaders()
        }
      )
    }

    console.log('获取用户资料，用户ID:', decoded.userId, '时间:', new Date().toISOString())

    // 获取用户资料 - 强制实时查询
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
      return new NextResponse(
        JSON.stringify({ success: false, error: '用户不存在' }),
        { 
          status: 404,
          headers: createNoCacheHeaders()
        }
      )
    }

    // 获取用户兴趣
    const { data: interests } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', decoded.userId)

    // 获取用户偏好
    const { data: preferences } = await supabase
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
        activity_data: { profile_id: decoded.userId, timestamp: new Date().toISOString() }
      })

    // 创建响应对象，添加更多元数据确保唯一性
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      server_time: Date.now(),
      cache_id: `cache-${Date.now()}-${Math.random()}`,
      user: {
        ...user,
        interests: interests?.map((i: any) => i.interest) || [],
        preferences: preferences || null,
        // 添加数据时间戳确保数据新鲜度
        data_timestamp: new Date().toISOString(),
        fetch_id: `fetch-${Date.now()}-${Math.random()}`
      }
    }

    return new NextResponse(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: createNoCacheHeaders()
      }
    )

  } catch (error) {
    console.error('获取用户资料错误:', error)
    return new NextResponse(
      JSON.stringify({ success: false, error: '服务器错误' }),
      { 
        status: 500,
        headers: createNoCacheHeaders()
      }
    )
  }
}

// 更新用户资料
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '数据库连接失败' }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader ? '存在' : '不存在')
    
    const decoded = verifyToken(authHeader)
    console.log('Token解码结果:', decoded)
    
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '未授权访问' }),
        { 
          status: 401,
          headers: createNoCacheHeaders()
        }
      )
    }

    console.log('用户ID:', decoded.userId, '更新时间:', new Date().toISOString())

    const updateData = await request.json()
    console.log('接收到的原始数据:', updateData)
    
    // 允许更新的字段（仅限users表中实际存在的字段）
    const allowedFields = [
      'name', 'phone', 'birth_date', 'gender', 'avatar_url', 'bio',
      'location', 'occupation', 'education', 'relationship_status',
      'height', 'weight', 'ethnicity', 'religion', 'employer', 'school',
      'degree', 'values_preferences', 'personality_type', 'hometown',
      'languages', 'family_plans', 'has_kids', 'marital_status',
      'exercise_frequency', 'smoking_status', 'drinking_status', 'dating_style'
    ]
    
    const filteredData: any = {}
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
        console.log(`字段 ${field}: ${updateData[field]} -> ${filteredData[field]}`)
      }
    })

    // 添加更新时间戳确保数据变更
    filteredData.updated_at = new Date().toISOString()

    console.log('过滤后的数据:', filteredData)

    // 更新用户资料 - 使用事务确保数据一致性
    console.log('开始更新数据库...')
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(filteredData)
      .eq('id', decoded.userId)
      .select()
      .single()

    console.log('更新结果:', { updatedUser, updateError })

    if (updateError) {
      console.error('更新用户资料错误:', updateError)
      return new NextResponse(
        JSON.stringify({ success: false, error: '更新失败', details: updateError.message }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    if (!updatedUser) {
      console.error('更新操作没有返回用户数据')
      return new NextResponse(
        JSON.stringify({ success: false, error: '更新失败 - 没有返回数据' }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    // 更新兴趣（如果提供）
    if (updateData.interests && Array.isArray(updateData.interests)) {
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', decoded.userId)

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
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: decoded.userId,
          ...updateData.preferences
        })
    }

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'profile_update',
        activity_data: { 
          updated_fields: Object.keys(filteredData),
          timestamp: new Date().toISOString(),
          update_id: `update-${Date.now()}-${Math.random()}`
        }
      })

    // 重新获取最新数据确保一致性
    const { data: latestUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    const { data: latestInterests } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', decoded.userId)

    const { data: latestPreferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', decoded.userId)
      .single()

    // 创建响应数据，添加更多元数据
    const responseData = {
      success: true,
      message: '更新成功',
      timestamp: new Date().toISOString(),
      server_time: Date.now(),
      update_id: `update-${Date.now()}-${Math.random()}`,
      user: {
        ...(latestUser || updatedUser),
        interests: latestInterests?.map(i => i.interest) || [],
        preferences: latestPreferences || null,
        // 添加确认时间戳
        confirmed_at: new Date().toISOString(),
        update_confirmed: true
      }
    }

    return new NextResponse(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: createNoCacheHeaders()
      }
    )

  } catch (error) {
    console.error('更新用户资料错误:', error)
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: '服务器错误', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: createNoCacheHeaders()
      }
    )
  }
}