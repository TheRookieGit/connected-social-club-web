import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
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

    console.log('🔍 检查喜欢状态 - 当前用户ID:', currentUserId, '目标用户ID:', targetUserId)
    
    // 检查是否已经喜欢该用户
    const { data: likeData, error: likeError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('liker_id', currentUserId)
      .eq('liked_id', targetUserId)
      .single()

    console.log('🔍 数据库查询结果:', { likeData, likeError })

    if (likeError && likeError.code !== 'PGRST116') {
      console.error('检查喜欢状态时出错:', likeError)
      return NextResponse.json({ error: '检查喜欢状态失败' }, { status: 500 })
    }

    const isLiked = !!likeData
    console.log('🔍 最终喜欢状态:', isLiked)

    return NextResponse.json({
      success: true,
      isLiked
    })

  } catch (error) {
    console.error('检查喜欢状态时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 