import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // 获取当前用户的token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // 解析自定义token格式
    let currentUserId: string
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        currentUserId = payload.userId.toString()
      } else {
        // 尝试使用Supabase标准格式
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) {
          return NextResponse.json({ error: '无效的token' }, { status: 401 })
        }
        currentUserId = user.id
      }
    } catch (error) {
      console.error('Token解析失败:', error)
      return NextResponse.json({ error: 'Token解析失败' }, { status: 401 })
    }
    const targetUserId = id

    // 删除喜欢记录
    const { data: unlikeData, error: unlikeError } = await supabase
      .from('user_likes')
      .delete()
      .eq('liker_id', currentUserId)
      .eq('liked_id', targetUserId)
      .select()
      .single()

    if (unlikeError && unlikeError.code !== 'PGRST116') {
      console.error('取消喜欢时出错:', unlikeError)
      return NextResponse.json({ error: '取消喜欢失败' }, { status: 500 })
    }

    // 如果没有找到记录，说明本来就没有喜欢过
    if (!unlikeData) {
      return NextResponse.json({ 
        success: false, 
        error: '本来就没有喜欢过该用户' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: '成功取消喜欢该用户',
      data: unlikeData
    })

  } catch (error) {
    console.error('取消喜欢用户时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 