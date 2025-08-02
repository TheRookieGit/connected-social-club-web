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

// 女性用户开始对话
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

    const { targetUserId, message } = await request.json()

    if (!targetUserId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: '目标用户ID和消息内容不能为空' },
        { status: 400 }
      )
    }

    console.log(`💬 [开始对话API] 用户 ${decoded.userId} 尝试与用户 ${targetUserId} 开始对话`)

    // 验证当前用户是否为女性
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, name, gender')
      .eq('id', decoded.userId)
      .single()

    if (userError || !currentUser) {
      console.error('❌ [开始对话API] 获取用户信息失败:', userError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    if (currentUser.gender !== '女') {
      console.log(`❌ [开始对话API] 用户 ${currentUser.name} (${currentUser.gender}) 不是女性，拒绝访问`)
      return NextResponse.json(
        { success: false, error: '此功能仅对女性用户开放' },
        { status: 403 }
      )
    }

    // 确保用户ID转换为整数
    const currentUserIdInt = parseInt(decoded.userId.toString())
    const targetUserIdInt = parseInt(targetUserId.toString())

    // 验证两个用户是否已匹配（检查双向匹配）
    const { data: matches, error: matchError } = await supabase
      .from('user_matches')
      .select('id, user_id, matched_user_id, match_status')
      .or(`and(user_id.eq.${currentUserIdInt},matched_user_id.eq.${targetUserIdInt}),and(user_id.eq.${targetUserIdInt},matched_user_id.eq.${currentUserIdInt})`)
      .eq('match_status', 'accepted')

    if (matchError) {
      console.error('❌ [开始对话API] 匹配检查错误:', matchError)
      return NextResponse.json(
        { success: false, error: '检查匹配状态失败' },
        { status: 500 }
      )
    }

    console.log(`🔍 [开始对话API] 匹配检查结果:`, matches)

    if (!matches || matches.length === 0) {
      console.log(`❌ [开始对话API] 用户 ${currentUserIdInt} 和 ${targetUserIdInt} 没有匹配记录`)
      return NextResponse.json(
        { success: false, error: '只能与已匹配的用户开始对话' },
        { status: 403 }
      )
    }

    // 检查是否已经存在对话（检查是否有消息记录）
    const { data: existingMessages, error: messageCheckError } = await supabase
      .from('user_messages')
      .select('id')
      .or(`and(sender_id.eq.${currentUserIdInt},receiver_id.eq.${targetUserIdInt}),and(sender_id.eq.${targetUserIdInt},receiver_id.eq.${currentUserIdInt})`)
      .limit(1)

    if (messageCheckError) {
      console.error('❌ [开始对话API] 检查现有消息错误:', messageCheckError)
      return NextResponse.json(
        { success: false, error: '检查对话状态失败' },
        { status: 500 }
      )
    }

    if (existingMessages && existingMessages.length > 0) {
      console.log(`❌ [开始对话API] 用户 ${currentUserIdInt} 和 ${targetUserIdInt} 已经存在对话`)
      return NextResponse.json(
        { success: false, error: '对话已经存在，请直接发送消息' },
        { status: 400 }
      )
    }

    console.log(`✅ [开始对话API] 验证通过，开始创建对话`)

    // 保存第一条消息到数据库
    const messageData = {
      sender_id: currentUserIdInt,
      receiver_id: targetUserIdInt,
      message: message.trim(),
      message_type: 'text',
      is_read: false,
      is_deleted: false
    }

    console.log(`📝 [开始对话API] 准备保存的消息数据:`, {
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
      console.error('❌ [开始对话API] 保存消息到数据库失败:', messageError)
      return NextResponse.json(
        { success: false, error: '保存消息失败: ' + messageError.message },
        { status: 500 }
      )
    }

    if (!newMessage || !newMessage.id) {
      console.error('❌ [开始对话API] 保存消息后未返回有效数据:', newMessage)
      return NextResponse.json(
        { success: false, error: '消息保存异常' },
        { status: 500 }
      )
    }

    console.log(`✅ [开始对话API] 消息保存成功，ID: ${newMessage.id}`)

    // 异步更新发送者的在线状态和活动日志
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
            activity_type: 'start_conversation',
            activity_data: {
              target_user_id: targetUserIdInt,
              message_id: newMessage.id,
              message_preview: message.trim().substring(0, 50)
            }
          })

        console.log(`📊 [开始对话API] 异步更新在线状态和活动日志完成`)
      } catch (error) {
        console.error('❌ [开始对话API] 异步更新在线状态或活动日志失败:', error)
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

    console.log(`✅ [开始对话API] 对话开始成功，返回数据:`, {
      ...responseData,
      content: responseData.content.substring(0, 50) + (responseData.content.length > 50 ? '...' : '')
    })

    return NextResponse.json({
      success: true,
      message: '对话开始成功！',
      data: responseData
    })

  } catch (error) {
    console.error('❌ [开始对话API] 开始对话系统错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
} 