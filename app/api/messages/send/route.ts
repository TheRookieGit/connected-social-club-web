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

    // 验证两个用户是否已匹配
    const { data: matchCheck } = await supabase
      .from('user_matches')
      .select('id')
      .eq('user_id', decoded.userId)
      .eq('matched_user_id', receiverId)
      .eq('match_status', 'accepted')
      .single()

    if (!matchCheck) {
      return NextResponse.json(
        { success: false, error: '只能向已匹配的用户发送消息' },
        { status: 403 }
      )
    }

    // 保存消息到数据库
    const { data: newMessage, error: messageError } = await supabase
      .from('user_messages')
      .insert({
        sender_id: decoded.userId,
        receiver_id: receiverId,
        message: message.trim(),
        message_type: messageType,
        is_read: false,
        is_deleted: false
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        created_at,
        sender:sender_id (name, avatar_url)
      `)
      .single()

    if (messageError) {
      console.error('保存消息错误:', messageError)
      return NextResponse.json(
        { success: false, error: '保存消息失败' },
        { status: 500 }
      )
    }

    // 更新发送者的在线状态
    await supabase
      .from('users')
      .update({
        is_online: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', decoded.userId)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'message',
        activity_data: {
          receiver_id: receiverId,
          message_type: messageType
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
        isRead: newMessage.is_read,
        sender: newMessage.sender
      }
    })

  } catch (error) {
    console.error('发送消息错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 