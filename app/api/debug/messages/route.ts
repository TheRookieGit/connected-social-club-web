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

// 调试消息数据
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
    const userId = searchParams.get('userId')
    const currentUserId = decoded.userId

    console.log(`🔍 [调试API] 用户 ${currentUserId} 请求调试消息数据`)

    // 获取用户的所有匹配
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id, user_id, matched_user_id, match_status')
      .or(`and(user_id.eq.${currentUserId},match_status.eq.accepted),and(matched_user_id.eq.${currentUserId},match_status.eq.accepted)`)

    if (matchError) {
      console.error('❌ [调试API] 获取匹配数据失败:', matchError)
      return NextResponse.json(
        { success: false, error: '获取匹配数据失败' },
        { status: 500 }
      )
    }

    console.log(`📊 [调试API] 找到 ${matches?.length || 0} 个匹配`)

    // 获取所有相关消息
    let messagesQuery = supabase
      .from('user_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        is_deleted,
        created_at
      `)
      .eq('is_deleted', false)

    // 如果指定了特定用户，只获取与该用户的消息
    if (userId) {
      messagesQuery = messagesQuery.or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
    } else {
      // 获取所有匹配用户的消息
      const matchedUserIds = matches?.map(m => 
        m.user_id === currentUserId ? m.matched_user_id : m.user_id
      ) || []
      
      if (matchedUserIds.length > 0) {
        const conditions = matchedUserIds.map(id => 
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUserId})`
        ).join(',')
        messagesQuery = messagesQuery.or(conditions)
      }
    }

    const { data: messages, error: messagesError } = await messagesQuery
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ [调试API] 获取消息数据失败:', messagesError)
      return NextResponse.json(
        { success: false, error: '获取消息数据失败' },
        { status: 500 }
      )
    }

    console.log(`📨 [调试API] 找到 ${messages?.length || 0} 条消息`)

    // 格式化消息数据
    const formattedMessages = messages?.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id.toString(),
      receiverId: msg.receiver_id.toString(),
      content: msg.message,
      messageType: msg.message_type,
      timestamp: msg.created_at,
      isRead: msg.is_read,
      isDeleted: msg.is_deleted
    })) || []

    // 按对话分组
    const conversations = new Map()
    formattedMessages.forEach(msg => {
      const otherUserId = msg.senderId === currentUserId.toString() ? msg.receiverId : msg.senderId
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, [])
      }
      conversations.get(otherUserId).push(msg)
    })

    // 获取用户信息
    const allUserIds = new Set()
    formattedMessages.forEach(msg => {
      allUserIds.add(msg.senderId)
      allUserIds.add(msg.receiverId)
    })

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, is_online, last_seen')
      .in('id', Array.from(allUserIds))

    if (usersError) {
      console.error('❌ [调试API] 获取用户数据失败:', usersError)
    }

    const userMap = new Map()
    users?.forEach(user => {
      userMap.set(user.id.toString(), user)
    })

    // 构建调试信息
    const debugInfo = {
      currentUserId: currentUserId.toString(),
      matches: matches || [],
      totalMessages: formattedMessages.length,
      conversations: Array.from(conversations.entries()).map(([userId, msgs]) => ({
        userId,
        userInfo: userMap.get(userId),
        messageCount: msgs.length,
        messages: msgs.slice(-5) // 只显示最近5条消息
      })),
      allMessages: formattedMessages.slice(-20), // 只显示最近20条消息
      users: users || []
    }

    console.log(`✅ [调试API] 成功返回调试信息`)

    return NextResponse.json({
      success: true,
      data: debugInfo
    })

  } catch (error) {
    console.error('❌ [调试API] 系统错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 