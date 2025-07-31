import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
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
        console.log('从自定义token解析的用户ID:', currentUserId)
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
    console.log('当前用户ID:', currentUserId, '类型:', typeof currentUserId)

    // 获取所有用户列表
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .limit(5)

    if (usersError) {
      console.error('获取用户列表失败:', usersError)
      return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
    }

    console.log('用户列表:', users)

    // 如果有用户，尝试喜欢第一个用户
    if (users && users.length > 0) {
      const targetUserId = users[0].id
      console.log('目标用户ID:', targetUserId, '类型:', typeof targetUserId)

      // 检查是否已经喜欢
      const { data: existingLike, error: checkError } = await supabase
        .from('user_likes')
        .select('*')
        .eq('liker_id', currentUserId)
        .eq('liked_id', targetUserId)
        .single()

      console.log('检查现有喜欢记录:', existingLike, '错误:', checkError)

      if (existingLike) {
        return NextResponse.json({
          success: true,
          message: '已经喜欢过该用户',
          currentUserId,
          targetUserId,
          existingLike
        })
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

      console.log('添加喜欢记录结果:', likeData, '错误:', likeError)

      if (likeError) {
        return NextResponse.json({ 
          error: '添加喜欢记录失败', 
          details: likeError,
          currentUserId,
          targetUserId
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: '成功喜欢该用户',
        currentUserId,
        targetUserId,
        likeData
      })
    }

    return NextResponse.json({
      success: false,
      message: '没有找到用户',
      currentUserId
    })

  } catch (error) {
    console.error('测试喜欢功能时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
} 