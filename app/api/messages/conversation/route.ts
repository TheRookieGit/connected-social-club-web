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
    const limit = parseInt(searchParams.get('limit') || '100')
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
    console.log(`🔢 [聊天API] 查询参数:`, {
      currentUserId: currentUserIdInt,
      otherUserId: otherUserIdInt,
      limit,
      offset
    })

    // 验证两个用户是否已匹配（检查双向匹配）
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id, user_id, matched_user_id')
      .or(`and(user_id.eq.${currentUserIdInt},matched_user_id.eq.${otherUserIdInt}),and(user_id.eq.${otherUserIdInt},matched_user_id.eq.${currentUserIdInt})`)
      .eq('match_status', 'accepted')

    if (matchError) {
      console.error('❌ [聊天API] 匹配检查错误:', matchError)
      return NextResponse.json(
        { success: false, error: '检查匹配状态失败' },
        { status: 500 }
      )
    }

    console.log(`🔍 [聊天API] 匹配检查结果:`, matches)

    if (!matches || matches.length === 0) {
      console.log(`❌ [聊天API] 用户 ${currentUserIdInt} 和 ${otherUserIdInt} 没有匹配记录`)
      return NextResponse.json(
        { success: false, error: '只能查看已匹配用户的聊天记录' },
        { status: 403 }
      )
    }

    console.log(`✅ [聊天API] 用户已匹配，开始获取聊天记录`)

    // 关键修复：使用完全相同的查询条件，确保一致性
    const queryCondition = `and(sender_id.eq.${currentUserIdInt},receiver_id.eq.${otherUserIdInt}),and(sender_id.eq.${otherUserIdInt},receiver_id.eq.${currentUserIdInt})`
    
    console.log(`🔍 [聊天API] 使用统一查询条件: ${queryCondition}`)

    // 直接获取所有消息，不使用分步查询
    const { data: messages, error: messagesError, count } = await supabase
      .from('user_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        created_at
      `, { count: 'exact' })
      .or(queryCondition)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })

    if (messagesError) {
      console.error('❌ [聊天API] 获取消息错误:', messagesError)
      return NextResponse.json(
        { success: false, error: '获取消息失败: ' + messagesError.message },
        { status: 500 }
      )
    }

    const allMessages = messages || []
    const actualTotal = count || 0
    
    console.log(`📊 [聊天API] 查询结果: 获取到 ${allMessages.length} 条消息，总计 ${actualTotal} 条`)
    
    // 数据一致性检查
    if (allMessages.length !== actualTotal) {
      console.warn(`⚠️ [聊天API] 数据不一致警告: 实际获取=${allMessages.length}, 总数=${actualTotal}`)
    }

    // 应用分页和限制
    let orderedMessages = allMessages
    
    // 如果有分页要求，从末尾开始取
    if (limit && limit < orderedMessages.length) {
      const startIndex = Math.max(0, orderedMessages.length - limit - offset)
      orderedMessages = orderedMessages.slice(startIndex, startIndex + limit)
      console.log(`📊 [聊天API] 应用分页，返回 ${orderedMessages.length} 条消息`)
    }

    console.log(`📥 [聊天API] 最终结果: 返回 ${orderedMessages.length} 条消息，总计 ${actualTotal} 条`)
    
    // 调试模式下记录关键信息
    if (process.env.NODE_ENV === 'development' && orderedMessages.length > 0) {
      const firstMsg = orderedMessages[0]
      const lastMsg = orderedMessages[orderedMessages.length - 1]
      console.log(`📋 [聊天API] 消息范围 - 最早: ID:${firstMsg.id} (${firstMsg.created_at})`)
      console.log(`📋 [聊天API] 消息范围 - 最新: ID:${lastMsg.id} (${lastMsg.created_at})`)
      
      // 特别关注最新的3条消息
      const latest3 = orderedMessages.slice(-3)
      console.log(`📋 [聊天API] 最新3条消息详情:`, latest3.map(m => ({
        id: m.id,
        content: m.message?.substring(0, 30),
        created_at: m.created_at,
        sender_id: m.sender_id
      })))
    }

    // 格式化消息数据，确保数据类型正确
    const formattedMessages = orderedMessages.map((msg: any) => {
      const formatted = {
        id: msg.id,
        senderId: msg.sender_id.toString(),
        receiverId: msg.receiver_id.toString(),
        content: msg.message,
        messageType: msg.message_type,
        timestamp: msg.created_at,
        isRead: msg.is_read
      }
      
      // 验证必要字段
      if (!formatted.id || !formatted.senderId || !formatted.receiverId || !formatted.content) {
        console.warn('⚠️ [聊天API] 发现不完整的消息数据:', formatted)
      }
      
      return formatted
    })

    console.log(`✅ [聊天API] 格式化后的消息数量: ${formattedMessages.length}`)

    // 异步更新已读状态，但不等待结果
    if (orderedMessages.length > 0) {
      const unreadMessages = orderedMessages.filter(msg => 
        msg.receiver_id === currentUserIdInt && 
        msg.sender_id === otherUserIdInt && 
        !msg.is_read
      )

      if (unreadMessages.length > 0) {
        console.log(`📖 [聊天API] 发现 ${unreadMessages.length} 条未读消息，准备标记为已读`)
        
        // 异步更新已读状态
        setImmediate(async () => {
          try {
            const { error: updateError } = await supabase
              .from('user_messages')
              .update({ is_read: true })
              .eq('receiver_id', currentUserIdInt)
              .eq('sender_id', otherUserIdInt)
              .eq('is_read', false)
              .eq('is_deleted', false)

            if (updateError) {
              console.error('❌ [聊天API] 异步更新已读状态错误:', updateError)
            } else {
              console.log(`📖 [聊天API] 异步更新已读状态完成，标记了 ${unreadMessages.length} 条消息`)
            }
          } catch (error) {
            console.error('❌ [聊天API] 异步更新已读状态异常:', error)
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

    // 异步更新在线状态
    setImmediate(async () => {
      try {
        await supabase
          .from('users')
          .update({
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', currentUserIdInt)
      } catch (error) {
        console.error('❌ [聊天API] 更新在线状态错误:', error)
      }
    })

    // 返回结果
    const result = {
      success: true,
      messages: formattedMessages,
      total: actualTotal,
      hasMore: actualTotal > offset + formattedMessages.length,
      pagination: {
        offset,
        limit,
        returned: formattedMessages.length,
        total: actualTotal
      },
      debug: {
        queryTotalCount: actualTotal,
        actualFetched: allMessages.length,
        afterPaging: formattedMessages.length,
        consistent: allMessages.length === actualTotal
      }
    }

    console.log(`✅ [聊天API] 成功返回 ${formattedMessages.length} 条消息，hasMore: ${result.hasMore}`)
    console.log(`🔍 [聊天API] 一致性检查: ${result.debug.consistent ? '✅ 通过' : '❌ 失败'}`)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ [聊天API] 获取聊天记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 