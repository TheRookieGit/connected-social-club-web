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
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

// 获取用户偏好
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

    console.log('获取用户偏好，用户ID:', decoded.userId)

    // 获取用户偏好
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', decoded.userId)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('获取用户偏好错误:', preferencesError)
      return NextResponse.json(
        { success: false, error: '获取用户偏好失败' },
        { status: 500 }
      )
    }

    // 如果没有偏好记录，返回默认值
    const defaultPreferences = {
      min_age: 18,
      max_age: 99,
      preferred_gender: [],
      max_distance: 50
    }

    return NextResponse.json({
      success: true,
      preferences: preferences || defaultPreferences
    })

  } catch (error) {
    console.error('获取用户偏好错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新用户偏好
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
    console.log('更新用户偏好，用户ID:', decoded.userId, '数据:', updateData)

    // 更新或插入用户偏好
    const { data: updatedPreferences, error: updateError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: decoded.userId,
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (updateError) {
      console.error('更新用户偏好错误:', updateError)
      return NextResponse.json(
        { success: false, error: '更新用户偏好失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    })

  } catch (error) {
    console.error('更新用户偏好错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 