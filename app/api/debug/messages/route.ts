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

// 调试消息查询
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
    const otherUserId = searchParams.get('userId')

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    console.log(`🔍 [调试API] 用户 ${decoded.userId} 调试与用户 ${otherUserId} 的消息`)

    // 1. 查询所有相关消息（不限制条件）
    const { data: allMessages, error: allError } = await supabase
      .from('user_messages')
      .select('*')
      .or(`sender_id.eq.${decoded.userId},receiver_id.eq.${decoded.userId}`)
      .order('created_at', { ascending: true })

    if (allError) {
      console.error('❌ [调试API] 查询所有消息错误:', allError)
      return NextResponse.json(
        { success: false, error: '查询失败: ' + allError.message },
        { status: 500 }
      )
    }

    console.log(`📋 [调试API] 用户 ${decoded.userId} 相关的所有消息:`, allMessages)

    // 2. 查询特定对话的消息
    const { data: conversationMessages, error: convError } = await supabase
      .from('user_messages')
      .select('*')
      .or(`and(sender_id.eq.${decoded.userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${decoded.userId})`)
      .order('created_at', { ascending: true })

    if (convError) {
      console.error('❌ [调试API] 查询对话消息错误:', convError)
      return NextResponse.json(
        { success: false, error: '查询失败: ' + convError.message },
        { status: 500 }
      )
    }

    console.log(`💬 [调试API] 与用户 ${otherUserId} 的对话消息:`, conversationMessages)

    // 3. 查询最近的消息
    const { data: recentMessages, error: recentError } = await supabase
      .from('user_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('❌ [调试API] 查询最近消息错误:', recentError)
    } else {
      console.log(`🕒 [调试API] 最近10条消息:`, recentMessages)
    }

    return NextResponse.json({
      success: true,
      debug: {
        currentUserId: decoded.userId,
        otherUserId: otherUserId,
        allUserMessages: allMessages || [],
        conversationMessages: conversationMessages || [],
        recentMessages: recentMessages || [],
        totalAllMessages: allMessages?.length || 0,
        totalConversationMessages: conversationMessages?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ [调试API] 调试消息查询错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 