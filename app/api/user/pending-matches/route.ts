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

// 计算用户年龄
function calculateAge(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// 获取待接受的匹配
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

    console.log('获取待接受匹配 - 当前用户ID:', decoded.userId)
    
    // 获取当前用户收到的所有待接受的匹配请求
    const { data: pendingMatches, error: matchesError } = await supabase
      .from('user_matches')
      .select('user_id, match_score, created_at')
      .eq('matched_user_id', decoded.userId)  // 当前用户是被匹配的对象
      .eq('match_status', 'pending')

    console.log('待接受匹配查询结果:', { pendingMatches, matchesError })

    if (matchesError) {
      console.error('获取待接受匹配错误:', matchesError)
      return NextResponse.json(
        { success: false, error: '获取待接受匹配失败' },
        { status: 500 }
      )
    }

    if (!pendingMatches || pendingMatches.length === 0) {
      console.log('没有找到待接受的匹配记录')
      return NextResponse.json({
        success: true,
        pendingMatches: [],
        total: 0
      })
    }

    // 获取发起匹配用户的详细信息
    const senderUserIds = pendingMatches.map(match => match.user_id)
    const { data: senderUsersData, error: usersError } = await supabase
      .from('users')
      .select('id, name, birth_date, gender, avatar_url, bio, location, occupation, is_online, last_seen, photos')
      .in('id', senderUserIds)

    if (usersError) {
      console.error('获取发起匹配用户信息错误:', usersError)
      return NextResponse.json(
        { success: false, error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    // 格式化待接受匹配数据
    const formattedPendingMatches = senderUsersData?.map((user: any) => {
      // 找到对应的匹配记录
      const matchRecord = pendingMatches.find(match => match.user_id === user.id)
      
      return {
        id: user.id,
        name: user.name,
        age: calculateAge(user.birth_date),
        gender: user.gender,
        location: user.location || '未知',
        bio: user.bio || '这个人很神秘...',
        occupation: user.occupation,
        avatar_url: user.avatar_url,
        isOnline: user.is_online || false,
        lastSeen: user.last_seen,
        matchScore: Math.round((matchRecord?.match_score || 0) * 100),
        matchedAt: matchRecord?.created_at
      }
    }) || []

    // 按匹配时间排序（最新的在前）
    formattedPendingMatches.sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime())

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'view_pending_matches',
        activity_data: { count: formattedPendingMatches.length }
      })

    return NextResponse.json({
      success: true,
      pendingMatches: formattedPendingMatches,
      total: formattedPendingMatches.length
    })

  } catch (error) {
    console.error('获取待接受匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 处理待接受匹配（接受或拒绝）
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

    const { senderUserId, action } = await request.json() // action: 'accept', 'reject'

    if (!senderUserId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '参数不完整或无效' },
        { status: 400 }
      )
    }

    console.log(`处理待接受匹配 - 发起者ID: ${senderUserId}, 当前用户ID: ${decoded.userId}, 动作: ${action}`)

    // 查找对应的匹配记录
    const { data: existingMatch, error: findError } = await supabase
      .from('user_matches')
      .select('*')
      .eq('user_id', senderUserId)
      .eq('matched_user_id', decoded.userId)
      .eq('match_status', 'pending')
      .single()

    if (findError || !existingMatch) {
      console.error('找不到待处理的匹配记录:', findError)
      return NextResponse.json(
        { success: false, error: '找不到待处理的匹配记录' },
        { status: 404 }
      )
    }

    if (action === 'accept') {
      // 更新原匹配记录为已接受
      const { error: updateError } = await supabase
        .from('user_matches')
        .update({ match_status: 'accepted' })
        .eq('id', existingMatch.id)

      if (updateError) {
        console.error('更新匹配状态错误:', updateError)
        return NextResponse.json(
          { success: false, error: '更新匹配状态失败' },
          { status: 500 }
        )
      }

      // 创建反向匹配记录（双向匹配）
      const { error: createError } = await supabase
        .from('user_matches')
        .insert({
          user_id: decoded.userId,
          matched_user_id: senderUserId,
          match_status: 'accepted',
          match_score: existingMatch.match_score
        })

      if (createError) {
        console.error('创建反向匹配错误:', createError)
        // 如果反向匹配创建失败，不影响主要流程
      }

      // 记录活动日志
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: decoded.userId,
          activity_type: 'accept_match',
          activity_data: { 
            sender_user_id: senderUserId,
            match_id: existingMatch.id
          }
        })

      return NextResponse.json({
        success: true,
        message: '匹配已接受！',
        isMatch: true
      })

    } else if (action === 'reject') {
      // 更新匹配记录为已拒绝
      const { error: updateError } = await supabase
        .from('user_matches')
        .update({ match_status: 'rejected' })
        .eq('id', existingMatch.id)

      if (updateError) {
        console.error('更新匹配状态错误:', updateError)
        return NextResponse.json(
          { success: false, error: '更新匹配状态失败' },
          { status: 500 }
        )
      }

      // 记录活动日志
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: decoded.userId,
          activity_type: 'reject_match',
          activity_data: { 
            sender_user_id: senderUserId,
            match_id: existingMatch.id
          }
        })

      return NextResponse.json({
        success: true,
        message: '匹配已拒绝',
        isMatch: false
      })
    }

  } catch (error) {
    console.error('处理待接受匹配错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 