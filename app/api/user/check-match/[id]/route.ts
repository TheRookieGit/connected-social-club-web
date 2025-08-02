import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    console.log('🔍 检查匹配状态 - 当前用户ID:', currentUserId, '目标用户ID:', targetUserId)

    // 检查双向喜欢关系
    const { data: myLike, error: myLikeError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('liker_id', currentUserId)
      .eq('liked_id', targetUserId)
      .single()

    const { data: theirLike, error: theirLikeError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('liker_id', targetUserId)
      .eq('liked_id', currentUserId)
      .single()

    console.log('🔍 匹配检查结果:', {
      myLike: !!myLike,
      theirLike: !!theirLike,
      myLikeError: myLikeError?.code,
      theirLikeError: theirLikeError?.code
    })

    // 如果双方都喜欢对方，则形成匹配
    const isMatch = !!myLike && !!theirLike

    return NextResponse.json({
      success: true,
      isMatch,
      myLike: !!myLike,
      theirLike: !!theirLike
    })

  } catch (error) {
    console.error('检查匹配状态时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 