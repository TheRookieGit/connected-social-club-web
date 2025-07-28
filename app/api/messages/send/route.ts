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
      console.error('❌ [消息API] 数据库连接失败')
      return NextResponse.json(
        { success: false, error: '数据库连接失败' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      console.error('❌ [消息API] Token验证失败')
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const { receiverId, message, messageType = 'text' } = await request.json()

    // 数据验证
    if (!receiverId || !message?.trim()) {
      console.error('❌ [消息API] 参数验证失败:', { receiverId, messageLength: message?.length })
      return NextResponse.json(
        { success: false, error: '接收者ID和消息内容不能为空' },
        { status: 400 }
      )
    }

    // 消息长度限制
    if (message.trim().length > 1000) {
      console.error('❌ [消息API] 消息过长:', message.trim().length)
      return NextResponse.json(
        { success: false, error: '消息内容不能超过1000字符' },
        { status: 400 }
      )
    }

    // 确保用户ID转换为整数
    const currentUserIdInt = parseInt(decoded.userId.toString())
    const receiverIdInt = parseInt(receiverId.toString())

    // 验证ID是否有效
    if (isNaN(currentUserIdInt) || isNaN(receiverIdInt)) {
      console.error('❌ [消息API] 用户ID格式错误:', { currentUserId: decoded.userId, receiverId })
      return NextResponse.json(
        { success: false, error: '用户ID格式错误' },
        { status: 400 }
      )
    }

    // 防止用户给自己发消息
    if (currentUserIdInt === receiverIdInt) {
      console.error('❌ [消息API] 用户尝试给自己发消息:', currentUserIdInt)
      return NextResponse.json(
        { success: false, error: '不能给自己发送消息' },
        { status: 400 }
      )
    }

    console.log(`💬 [消息API] 用户 ${currentUserIdInt} 尝试向用户 ${receiverIdInt} 发送消息`)
    console.log(`📝 [消息API] 消息内容预览: "${message.trim().substring(0, 50)}${message.trim().length > 50 ? '...' : ''}"`)

    // 验证两个用户是否已匹配（检查双向匹配）
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id, user_id, matched_user_id')
      .or(`and(user_id.eq.${currentUserIdInt},matched_user_id.eq.${receiverIdInt}),and(user_id.eq.${receiverIdInt},matched_user_id.eq.${currentUserIdInt})`)
      .eq('match_status', 'accepted')

    if (matchError) {
      console.error('❌ [消息API] 匹配检查数据库错误:', matchError)
      return NextResponse.json(
        { success: false, error: '检查匹配状态失败' },
        { status: 500 }
      )
    }

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

    console.log(`📝 [消息API] 准备保存的消息数据:`, {
      ...messageData,
      message: messageData.message.substring(0, 50) + (messageData.message.length > 50 ? '...' : '')
    })

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
      console.error('❌ [消息API] 保存消息到数据库失败:', messageError)
      return NextResponse.json(
        { success: false, error: '保存消息失败: ' + messageError.message },
        { status: 500 }
      )
    }

    if (!newMessage || !newMessage.id) {
      console.error('❌ [消息API] 保存消息后未返回有效数据:', newMessage)
      return NextResponse.json(
        { success: false, error: '消息保存异常' },
        { status: 500 }
      )
    }

    console.log(`✅ [消息API] 消息保存成功，ID: ${newMessage.id}`)

    // 异步更新发送者的在线状态和活动日志，不影响响应速度
    setImmediate(async () => {
      try {
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

        console.log(`📊 [消息API] 异步更新在线状态和活动日志完成`)
      } catch (error) {
        console.error('❌ [消息API] 异步更新在线状态或活动日志失败:', error)
      }
    })

    // 格式化返回数据
    const responseData = {
      id: newMessage.id,
      senderId: newMessage.sender_id.toString(),
      receiverId: newMessage.receiver_id.toString(),
      content: newMessage.message,
      messageType: newMessage.message_type,
      timestamp: newMessage.created_at,
      isRead: newMessage.is_read
    }

    console.log(`✅ [消息API] 消息发送成功，返回数据:`, {
      ...responseData,
      content: responseData.content.substring(0, 50) + (responseData.content.length > 50 ? '...' : '')
    })

    return NextResponse.json({
      success: true,
      message: '消息发送成功',
      data: responseData
    })

  } catch (error) {
    console.error('❌ [消息API] 发送消息系统错误:', error)
    
    // 返回通用错误，避免泄露系统信息
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
} 