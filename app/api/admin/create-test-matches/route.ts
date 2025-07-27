import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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

    // 检查用户权限
    const { data: currentUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', decoded.userId)
      .single()

    if (!currentUser || currentUser.email !== 'admin@socialclub.com') {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: '缺少目标用户ID' },
        { status: 400 }
      )
    }

    // 获取所有用户（除了目标用户）
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .neq('id', targetUserId)
      .eq('status', 'active')
      .limit(5)

    if (usersError || !allUsers || allUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到其他用户' },
        { status: 400 }
      )
    }

    // 为目标用户创建一些测试匹配
    const matchesToCreate = []
    for (let i = 0; i < Math.min(3, allUsers.length); i++) {
      const otherUser = allUsers[i]
      
      // 创建双向匹配
      matchesToCreate.push(
        {
          user_id: targetUserId,
          matched_user_id: otherUser.id,
          match_status: 'accepted',
          match_score: 0.8 + Math.random() * 0.2,
        },
        {
          user_id: otherUser.id,
          matched_user_id: targetUserId,
          match_status: 'accepted',
          match_score: 0.8 + Math.random() * 0.2,
        }
      )
    }

    // 批量插入匹配记录
    const { data: insertedMatches, error: insertError } = await supabase
      .from('user_matches')
      .upsert(matchesToCreate, { 
        onConflict: 'user_id,matched_user_id',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      console.error('创建匹配记录错误:', insertError)
      return NextResponse.json(
        { success: false, error: '创建匹配记录失败: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ 成功创建测试匹配:', insertedMatches)

    return NextResponse.json({
      success: true,
      message: `成功为用户 ${targetUserId} 创建了 ${matchesToCreate.length / 2} 个匹配`,
      matches: insertedMatches
    })

  } catch (error) {
    console.error('创建测试匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 