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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const searchTerm = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const offset = (page - 1) * limit

    console.log(`📋 [管理员API] 获取聊天记录 - 页面${page}, 限制${limit}`)

    // 构建查询条件
    let query = supabase
      .from('user_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        is_read,
        is_deleted,
        created_at,
        sender:sender_id (id, name, email),
        receiver:receiver_id (id, name, email)
      `)
      .order('created_at', { ascending: false })

    // 添加筛选条件
    if (userId) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    }

    if (searchTerm) {
      query = query.ilike('message', `%${searchTerm}%`)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // 获取总数
    const { count } = await supabase
      .from('user_messages')
      .select('*', { count: 'exact', head: true })

    // 获取分页数据
    const { data: messages, error: messagesError } = await query
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('❌ [管理员API] 获取消息错误:', messagesError)
      return NextResponse.json(
        { success: false, error: '获取消息失败: ' + messagesError.message },
        { status: 500 }
      )
    }

    console.log(`✅ [管理员API] 获取到 ${messages?.length || 0} 条消息`)

    // 格式化消息数据
    const formattedMessages = messages?.map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      senderName: msg.sender?.name || '未知用户',
      senderEmail: msg.sender?.email || '',
      receiverName: msg.receiver?.name || '未知用户',
      receiverEmail: msg.receiver?.email || '',
      content: msg.message,
      messageType: msg.message_type,
      isRead: msg.is_read,
      isDeleted: msg.is_deleted,
      createdAt: msg.created_at
    })) || []

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalMessages: count || 0,
        messagesPerPage: limit
      }
    })

  } catch (error) {
    console.error('❌ [管理员API] 获取聊天记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除消息（软删除）
export async function DELETE(request: NextRequest) {
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

    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: '消息ID不能为空' },
        { status: 400 }
      )
    }

    console.log(`🗑️ [管理员API] 删除消息 ID: ${messageId}`)

    const { error: deleteError } = await supabase
      .from('user_messages')
      .update({ is_deleted: true })
      .eq('id', messageId)

    if (deleteError) {
      console.error('❌ [管理员API] 删除消息错误:', deleteError)
      return NextResponse.json(
        { success: false, error: '删除消息失败: ' + deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ [管理员API] 消息已标记为删除`)

    return NextResponse.json({
      success: true,
      message: '消息已删除'
    })

  } catch (error) {
    console.error('❌ [管理员API] 删除消息错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 