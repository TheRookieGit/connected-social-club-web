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
    const limit = parseInt(searchParams.get('limit') || '100') // 增加到100条
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    // 确保用户ID转换为整数
    const currentUserIdInt = parseInt(decoded.userId.toString())
    const otherUserIdInt = parseInt(otherUserId.toString())

    console.log(`📱 [聊天API] 用户 ${currentUserIdInt} 获取与用户 ${otherUserIdInt} 的聊天记录`)
    console.log(`🔢 [聊天API] 数据类型检查:`, {
      currentUserId: currentUserIdInt,
      currentUserIdType: typeof currentUserIdInt,
      otherUserId: otherUserIdInt,
      otherUserIdType: typeof otherUserIdInt
    })

    // 验证两个用户是否已匹配（检查双向匹配）
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id, user_id, matched_user_id')
      .or(`and(user_id.eq.${currentUserIdInt},matched_user_id.eq.${otherUserIdInt}),and(user_id.eq.${otherUserIdInt},matched_user_id.eq.${currentUserIdInt})`)
      .eq('match_status', 'accepted')

    console.log(`🔍 [聊天API] 匹配检查结果:`, matches)

    if (!matches || matches.length === 0) {
      console.log(`❌ [聊天API] 用户 ${currentUserIdInt} 和 ${otherUserIdInt} 没有匹配记录`)
      return NextResponse.json(
        { success: false, error: '只能查看已匹配用户的聊天记录' },
        { status: 403 }
      )
    }

    console.log(`✅ [聊天API] 用户已匹配，开始获取聊天记录`)

    // 构建查询条件
    const queryCondition = `and(sender_id.eq.${currentUserIdInt},receiver_id.eq.${otherUserIdInt}),and(sender_id.eq.${otherUserIdInt},receiver_id.eq.${currentUserIdInt})`
    console.log(`🔍 [聊天API] 查询条件:`, queryCondition)
    console.log(`🔍 [聊天API] 查询参数:`, {
      currentUserId: currentUserIdInt,
      otherUserId: otherUserIdInt,
      offset,
      limit
    })

    // 获取聊天记录（恢复分页功能，默认100条）
    const { data: messages, error: messagesError } = await supabase
      .from('user_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        created_at
      `)
      .or(queryCondition)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('❌ [聊天API] 获取消息错误:', messagesError)
      return NextResponse.json(
        { success: false, error: '获取消息失败: ' + messagesError.message },
        { status: 500 }
      )
    }

    console.log(`📥 [聊天API] 获取到 ${messages?.length || 0} 条消息（分页: ${offset}-${offset + limit - 1}）`)
    console.log(`📋 [聊天API] 原始消息数据:`, messages)

    // 格式化消息数据
    const formattedMessages = messages?.map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id.toString(),
      receiverId: msg.receiver_id.toString(),
      content: msg.message,
      messageType: msg.message_type,
      timestamp: new Date(msg.created_at),
      isRead: msg.is_read
    })) || []

    console.log(`✅ [聊天API] 格式化后的消息:`, formattedMessages)

    // 只标记当前用户接收的消息为已读（不重新获取数据，避免干扰同步）
    if (messages && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        msg.receiver_id === currentUserIdInt && 
        msg.sender_id === otherUserIdInt && 
        !msg.is_read
      )

      if (unreadMessages.length > 0) {
        console.log(`📖 [聊天API] 准备标记 ${unreadMessages.length} 条消息为已读`)
        
        // 异步更新已读状态，不等待结果，避免影响响应
        supabase
          .from('user_messages')
          .update({ is_read: true })
          .eq('receiver_id', currentUserIdInt)
          .eq('sender_id', otherUserIdInt)
          .eq('is_read', false)
          .then(({ error: updateError }) => {
            if (updateError) {
              console.error('❌ [聊天API] 更新已读状态错误:', updateError)
            } else {
              console.log(`📖 [聊天API] 异步更新已读状态完成`)
            }
          })
        
        // 立即更新返回数据中的已读状态
        formattedMessages.forEach(msg => {
          if (msg.receiverId === currentUserIdInt.toString() && 
              msg.senderId === otherUserIdInt.toString()) {
            msg.isRead = true
          }
        })
      } else {
        console.log(`📖 [聊天API] 没有需要标记为已读的消息`)
      }
    }

    // 更新在线状态
    await supabase
      .from('users')
      .update({
        is_online: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', currentUserIdInt)

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      total: formattedMessages.length,
      hasMore: formattedMessages.length === limit
    })

  } catch (error) {
    console.error('❌ [聊天API] 获取聊天记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 