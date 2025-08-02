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

    // 检查是否已经喜欢该用户
    const { data: existingLike, error: checkError } = await supabase
      .from('user_likes')
      .select('*')
      .eq('liker_id', currentUserId)
      .eq('liked_id', targetUserId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查喜欢状态时出错:', checkError)
      return NextResponse.json({ error: '检查喜欢状态失败' }, { status: 500 })
    }

    if (existingLike) {
      return NextResponse.json({ 
        success: false, 
        error: '已经喜欢过该用户' 
      }, { status: 400 })
    }

    // 添加喜欢记录
    const { data: likeData, error: likeError } = await supabase
      .from('user_likes')
      .insert({
        liker_id: currentUserId,
        liked_id: targetUserId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (likeError) {
      console.error('添加喜欢记录时出错:', likeError)
      return NextResponse.json({ error: '添加喜欢记录失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '成功喜欢该用户',
      data: likeData
    })

  } catch (error) {
    console.error('喜欢用户时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 