import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

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

// 计算两点之间的距离（使用 Haversine 公式）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 更新用户位置
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

    const { latitude, longitude, accuracy } = await request.json()

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { success: false, error: '无效的坐标数据' },
        { status: 400 }
      )
    }

    // 验证坐标范围
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, error: '坐标超出有效范围' },
        { status: 400 }
      )
    }

    // 更新用户位置信息
    const { error: updateError } = await supabase
      .from('users')
      .update({
        latitude: latitude,
        longitude: longitude,
        location_accuracy: accuracy || null,
        location_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId)

    if (updateError) {
      console.error('更新用户位置错误:', updateError)
      return NextResponse.json(
        { success: false, error: '更新位置失败' },
        { status: 500 }
      )
    }

    // 记录位置更新日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'location_update',
        activity_data: { 
          latitude, 
          longitude, 
          accuracy,
          timestamp: new Date().toISOString() 
        }
      })

    return NextResponse.json({
      success: true,
      message: '位置更新成功',
      location: { latitude, longitude, accuracy }
    })

  } catch (error) {
    console.error('更新用户位置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取附近用户
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
    const radius = parseFloat(searchParams.get('radius') || '50') // 默认50公里
    const limit = parseInt(searchParams.get('limit') || '20')
    const latitude = parseFloat(searchParams.get('latitude') || '0')
    const longitude = parseFloat(searchParams.get('longitude') || '0')

    // 如果没有提供坐标，使用当前用户的位置
    let userLat = latitude
    let userLon = longitude

    if (latitude === 0 && longitude === 0) {
      // 获取当前用户的位置
      const { data: currentUser } = await supabase
        .from('users')
        .select('latitude, longitude')
        .eq('id', decoded.userId)
        .single()

      if (!currentUser?.latitude || !currentUser?.longitude) {
        return NextResponse.json(
          { success: false, error: '用户位置信息不可用' },
          { status: 400 }
        )
      }

      userLat = currentUser.latitude
      userLon = currentUser.longitude
    }

    // 获取所有在线用户的位置信息
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        avatar_url,
        bio,
        location,
        latitude,
        longitude,
        is_online,
        last_seen,
        created_at
      `)
      .eq('status', 'active')
      .not('id', 'eq', decoded.userId) // 排除自己
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (usersError) {
      console.error('获取用户列表错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取用户列表失败' },
        { status: 500 }
      )
    }

    // 计算距离并过滤在指定半径内的用户
    const nearbyUsers = users
      .map(user => {
        const distance = calculateDistance(
          userLat,
          userLon,
          user.latitude,
          user.longitude
        )
        return {
          ...user,
          distance: distance,
          distance_formatted: distance < 1 
            ? `${Math.round(distance * 1000)} 米`
            : `${distance.toFixed(1)} 公里`
        }
      })
      .filter(user => user.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      users: nearbyUsers,
      total: nearbyUsers.length,
      radius: radius,
      user_location: { latitude: userLat, longitude: userLon }
    })

  } catch (error) {
    console.error('获取附近用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 