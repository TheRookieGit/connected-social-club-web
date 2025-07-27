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

// 获取聊天记录
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    // 验证两个用户是否已匹配
    const { data: matchCheck } = await supabase
      .from('user_matches')
      .select('id')
      .eq('user_id', decoded.userId)
      .eq('matched_user_id', otherUserId)
      .eq('match_status', 'accepted')
      .single()

    if (!matchCheck) {
      return NextResponse.json(
        { success: false, error: '只能查看已匹配用户的聊天记录' },
        { status: 403 }
      )
    }

    // 获取聊天记录
    const { data: messages, error: messagesError } = await supabase
      .from('user_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        created_at,
        sender:sender_id (name, avatar_url),
        receiver:receiver_id (name, avatar_url)
      `)
      .or(`and(sender_id.eq.${decoded.userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${decoded.userId})`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('获取消息错误:', messagesError)
      return NextResponse.json(
        { success: false, error: '获取消息失败' },
        { status: 500 }
      )
    }

    // 格式化消息数据
    const formattedMessages = messages?.map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id.toString(),
      receiverId: msg.receiver_id.toString(),
      content: msg.message,
      messageType: msg.message_type,
      timestamp: new Date(msg.created_at),
      isRead: msg.is_read,
      sender: msg.sender,
      receiver: msg.receiver
    })) || []

    // 标记当前用户接收的消息为已读
    if (messages && messages.length > 0) {
      await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('receiver_id', decoded.userId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false)
    }

    // 更新在线状态
    await supabase
      .from('users')
      .update({
        is_online: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', decoded.userId)

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      total: formattedMessages.length,
      hasMore: formattedMessages.length === limit
    })

  } catch (error) {
    console.error('获取聊天记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 