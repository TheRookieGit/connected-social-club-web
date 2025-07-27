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

    const { matches } = await request.json()

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少匹配数据' },
        { status: 400 }
      )
    }

    // 验证当前用户有权限（可以是任何登录用户，用于测试）
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', decoded.userId)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    console.log('创建待接受匹配数据，用户:', currentUser.email, '数据:', matches)

    // 验证所有涉及的用户ID都存在
    const allUserIds = new Set()
    matches.forEach(match => {
      allUserIds.add(match.user_id)
      allUserIds.add(match.matched_user_id)
    })

    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', Array.from(allUserIds))

    if (usersError || !existingUsers || existingUsers.length !== allUserIds.size) {
      return NextResponse.json(
        { success: false, error: '部分用户ID不存在' },
        { status: 400 }
      )
    }

    // 检查是否已存在匹配记录，避免重复
    const matchConditions = matches.map(match => `(user_id.eq.${match.user_id},matched_user_id.eq.${match.matched_user_id})`)
    
    // 批量插入匹配记录
    const { data: insertedMatches, error: insertError } = await supabase
      .from('user_matches')
      .upsert(matches, { 
        onConflict: 'user_id,matched_user_id',
        ignoreDuplicates: false 
      })
      .select()

    if (insertError) {
      console.error('创建待接受匹配记录错误:', insertError)
      return NextResponse.json(
        { success: false, error: '创建匹配记录失败: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ 成功创建待接受匹配:', insertedMatches)

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'create_pending_matches',
        activity_data: { 
          count: matches.length,
          created_by: currentUser.email 
        }
      })

    return NextResponse.json({
      success: true,
      message: `成功创建了 ${matches.length} 个待接受匹配`,
      matches: insertedMatches
    })

  } catch (error) {
    console.error('创建待接受匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 