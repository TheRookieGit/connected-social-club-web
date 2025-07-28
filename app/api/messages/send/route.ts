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

// 发送消息
export async function POST(request: NextRequest) {
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

    const { receiverId, message, messageType = 'text' } = await request.json()

    if (!receiverId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: '接收者ID和消息内容不能为空' },
        { status: 400 }
      )
    }

    // 确保用户ID转换为整数
    const currentUserIdInt = parseInt(decoded.userId.toString())
    const receiverIdInt = parseInt(receiverId.toString())

    console.log(`💬 [消息API] 用户 ${currentUserIdInt} 尝试向用户 ${receiverIdInt} 发送消息`)
    console.log(`🔢 [消息API] 数据类型检查:`, {
      currentUserId: currentUserIdInt,
      currentUserIdType: typeof currentUserIdInt,
      receiverId: receiverIdInt,
      receiverIdType: typeof receiverIdInt
    })

    // 验证两个用户是否已匹配（检查双向匹配）
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id, user_id, matched_user_id')
      .or(`and(user_id.eq.${currentUserIdInt},matched_user_id.eq.${receiverIdInt}),and(user_id.eq.${receiverIdInt},matched_user_id.eq.${currentUserIdInt})`)
      .eq('match_status', 'accepted')

    console.log(`🔍 [消息API] 匹配检查结果:`, matches)

    if (!matches || matches.length === 0) {
      console.log(`❌ [消息API] 用户 ${currentUserIdInt} 和 ${receiverIdInt} 没有匹配记录`)
      return NextResponse.json(
        { success: false, error: '只能向已匹配的用户发送消息' },
        { status: 403 }
      )
    }

    console.log(`✅ [消息API] 用户已匹配，开始保存消息`)

    // 保存消息到数据库
    const messageData = {
      sender_id: currentUserIdInt,
      receiver_id: receiverIdInt,
      message: message.trim(),
      message_type: messageType,
      is_read: false,
      is_deleted: false
    }

    console.log(`📝 [消息API] 准备保存的消息数据:`, messageData)

    const { data: newMessage, error: messageError } = await supabase
      .from('user_messages')
      .insert(messageData)
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        created_at
      `)
      .single()

    if (messageError) {
      console.error('❌ [消息API] 保存消息错误:', messageError)
      return NextResponse.json(
        { success: false, error: '保存消息失败: ' + messageError.message },
        { status: 500 }
      )
    }

    console.log(`✅ [消息API] 消息保存成功:`, newMessage)

    // 更新发送者的在线状态
    await supabase
      .from('users')
      .update({
        is_online: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', currentUserIdInt)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: currentUserIdInt,
        activity_type: 'message',
        activity_data: {
          receiver_id: receiverIdInt,
          message_type: messageType,
          message_id: newMessage.id
        }
      })

    return NextResponse.json({
      success: true,
      message: '消息发送成功',
      data: {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        receiverId: newMessage.receiver_id,
        content: newMessage.message,
        messageType: newMessage.message_type,
        timestamp: newMessage.created_at,
        isRead: newMessage.is_read // 确保返回已读状态
      }
    })

  } catch (error) {
    console.error('❌ [消息API] 发送消息错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 