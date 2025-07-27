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

// 更新在线状态
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

    const { isOnline = true } = await request.json()

    // 更新用户在线状态
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', decoded.userId)

    if (updateError) {
      console.error('更新在线状态错误:', updateError)
      return NextResponse.json(
        { success: false, error: '更新在线状态失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `在线状态已更新为${isOnline ? '在线' : '离线'}`
    })

  } catch (error) {
    console.error('更新在线状态错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取用户在线状态
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
    const userIds = searchParams.get('userIds')?.split(',') || []

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户ID列表不能为空' },
        { status: 400 }
      )
    }

    // 获取指定用户的在线状态
    const { data: usersStatus, error: statusError } = await supabase
      .from('users')
      .select('id, is_online, last_seen')
      .in('id', userIds)

    if (statusError) {
      console.error('获取在线状态错误:', statusError)
      return NextResponse.json(
        { success: false, error: '获取在线状态失败' },
        { status: 500 }
      )
    }

    const statusMap = usersStatus?.reduce((acc: any, user: any) => {
      acc[user.id] = {
        isOnline: user.is_online,
        lastSeen: user.last_seen
      }
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      statusMap
    })

  } catch (error) {
    console.error('获取在线状态错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 