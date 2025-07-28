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
    const userId1 = searchParams.get('userId1') || '6'
    const userId2 = searchParams.get('userId2') || '7'

    const currentUserIdInt = parseInt(decoded.userId.toString())
    const user1Int = parseInt(userId1)
    const user2Int = parseInt(userId2)

    console.log(`🔍 [调试API] 当前用户: ${currentUserIdInt}, 查询用户: ${user1Int} 和 ${user2Int}`)

    // 1. 直接查询所有消息，不使用任何过滤
    console.log(`📊 [调试API] 查询所有相关消息...`)
    
    const { data: allMessages, error: allError } = await supabase
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
      .or(`and(sender_id.eq.${user1Int},receiver_id.eq.${user2Int}),and(sender_id.eq.${user2Int},receiver_id.eq.${user1Int})`)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })

    if (allError) {
      console.error('❌ [调试API] 查询错误:', allError)
      return NextResponse.json(
        { success: false, error: '查询失败: ' + allError.message },
        { status: 500 }
      )
    }

    // 2. 统计信息
    const totalMessages = allMessages?.length || 0
    const deletedMessages = allMessages?.filter(msg => msg.is_deleted) || []
    const activeMessages = allMessages?.filter(msg => !msg.is_deleted) || []
    
    console.log(`📋 [调试API] 消息统计:`)
    console.log(`  总消息数: ${totalMessages}`)
    console.log(`  已删除: ${deletedMessages.length}`)
    console.log(`  活跃消息: ${activeMessages.length}`)

    // 3. 检查最新消息
    const latestMessages = activeMessages.slice(-10)
    console.log(`📋 [调试API] 最新10条消息:`)
    latestMessages.forEach(msg => {
      console.log(`  ID:${msg.id} | ${msg.sender_id}→${msg.receiver_id} | "${msg.message}" | ${msg.created_at} | 删除:${msg.is_deleted}`)
    })

    // 4. 模拟不同用户的查询结果
    const user1Query = activeMessages.filter(msg => 
      (msg.sender_id === user1Int && msg.receiver_id === user2Int) ||
      (msg.sender_id === user2Int && msg.receiver_id === user1Int)
    )

    const user2Query = activeMessages.filter(msg => 
      (msg.sender_id === user1Int && msg.receiver_id === user2Int) ||
      (msg.sender_id === user2Int && msg.receiver_id === user1Int)
    )

    // 5. 检查是否有权限相关的差异
    console.log(`🔍 [调试API] 用户查询对比:`)
    console.log(`  用户${user1Int}视角: ${user1Query.length} 条消息`)
    console.log(`  用户${user2Int}视角: ${user2Query.length} 条消息`)

    // 6. 查找可能的权限问题
    const permissionCheck = await supabase
      .from('user_messages')
      .select('*')
      .eq('id', activeMessages[activeMessages.length - 1]?.id)

    console.log(`🔒 [调试API] 权限检查最新消息:`, permissionCheck.data)

    return NextResponse.json({
      success: true,
      debug: {
        currentUser: currentUserIdInt,
        queryUsers: [user1Int, user2Int],
        statistics: {
          total: totalMessages,
          deleted: deletedMessages.length,
          active: activeMessages.length
        },
        latestMessages: latestMessages.map(msg => ({
          id: msg.id,
          from: msg.sender_id,
          to: msg.receiver_id,
          content: msg.message?.substring(0, 50),
          created: msg.created_at,
          deleted: msg.is_deleted
        })),
        userQueries: {
          user1Count: user1Query.length,
          user2Count: user2Query.length,
          difference: Math.abs(user1Query.length - user2Query.length)
        },
        rawData: {
          allMessages: allMessages?.map(msg => ({
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            message: msg.message,
            is_deleted: msg.is_deleted,
            created_at: msg.created_at
          }))
        }
      }
    })

  } catch (error) {
    console.error('❌ [调试API] 系统错误:', error)
    return NextResponse.json(
      { success: false, error: '系统错误' },
      { status: 500 }
    )
  }
} 