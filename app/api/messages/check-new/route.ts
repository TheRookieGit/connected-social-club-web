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

// 检查新消息
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
    const lastMessageId = searchParams.get('lastMessageId')

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    const currentUserIdInt = parseInt(decoded.userId.toString())
    const otherUserIdInt = parseInt(otherUserId.toString())

    console.log(`🔔 [新消息检查] 用户 ${currentUserIdInt} 检查与 ${otherUserIdInt} 的新消息`)

    // 验证用户匹配关系
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id')
      .or(`and(user_id.eq.${currentUserIdInt},matched_user_id.eq.${otherUserIdInt}),and(user_id.eq.${otherUserIdInt},matched_user_id.eq.${currentUserIdInt})`)
      .eq('match_status', 'accepted')
      .limit(1)

    if (matchError || !matches || matches.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户未匹配' },
        { status: 403 }
      )
    }

    // 构建查询条件
    let query = supabase
      .from('user_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        created_at
      `)
      .or(`and(sender_id.eq.${currentUserIdInt},receiver_id.eq.${otherUserIdInt}),and(sender_id.eq.${otherUserIdInt},receiver_id.eq.${currentUserIdInt})`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5) // 只获取最新5条消息

    // 如果提供了最新消息ID，只获取比它更新的消息
    if (lastMessageId && lastMessageId !== 'null') {
      query = query.gt('id', parseInt(lastMessageId))
    }

    const { data: messages, error: messagesError } = await query

    if (messagesError) {
      console.error('❌ [新消息检查] 查询错误:', messagesError)
      return NextResponse.json(
        { success: false, error: '查询失败' },
        { status: 500 }
      )
    }

    const hasNewMessages = messages && messages.length > 0
    const latestMessage = hasNewMessages ? messages[0] : null

    // 格式化最新消息
    const formattedLatestMessage = latestMessage ? {
      id: latestMessage.id,
      senderId: latestMessage.sender_id.toString(),
      receiverId: latestMessage.receiver_id.toString(),
      content: latestMessage.message,
      timestamp: latestMessage.created_at
    } : null

    // 检查是否有未读消息
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('user_messages')
      .select('id')
      .eq('receiver_id', currentUserIdInt)
      .eq('sender_id', otherUserIdInt)
      .eq('is_read', false)
      .eq('is_deleted', false)

    const unreadCount = unreadMessages?.length || 0

    console.log(`🔔 [新消息检查] 结果: 新消息=${hasNewMessages}, 未读数=${unreadCount}`)

    return NextResponse.json({
      success: true,
      hasNewMessages,
      latestMessage: formattedLatestMessage,
      unreadCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ [新消息检查] 系统错误:', error)
    return NextResponse.json(
      { success: false, error: '系统错误' },
      { status: 500 }
    )
  }
} 