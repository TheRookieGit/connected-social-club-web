import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

// 验证 JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  
  try {
    // 尝试解析自定义token格式
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      if (payload.userId) {
        return { userId: payload.userId.toString() }
      }
    }
    
    // 尝试JWT标准格式
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json({ error: '数据库连接失败' }, { status: 500 })
    }
    
    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const currentUserId = decoded.userId
    const targetUserId = id

    console.log('🔍 检查匹配状态 - 当前用户ID:', currentUserId, '目标用户ID:', targetUserId)

    // 检查当前用户是否对目标用户执行过喜欢操作
    const { data: myMatch, error: myMatchError } = await supabase
      .from('user_matches')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('matched_user_id', targetUserId)
      .single()

    // 检查目标用户是否对当前用户执行过喜欢操作
    const { data: theirMatch, error: theirMatchError } = await supabase
      .from('user_matches')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('matched_user_id', currentUserId)
      .single()

    console.log('🔍 匹配检查结果:', {
      myMatch: myMatch ? `${myMatch.match_status}` : null,
      theirMatch: theirMatch ? `${theirMatch.match_status}` : null,
      myMatchError: myMatchError?.code,
      theirMatchError: theirMatchError?.code
    })

    // 判断状态
    const hasLiked = !!myMatch && (myMatch.match_status === 'pending' || myMatch.match_status === 'accepted')
    const isMatched = !!myMatch && !!theirMatch && 
                     (myMatch.match_status === 'pending' || myMatch.match_status === 'accepted') &&
                     (theirMatch.match_status === 'pending' || theirMatch.match_status === 'accepted')

    return NextResponse.json({
      success: true,
      hasLiked,
      isMatched,
      myMatchStatus: myMatch?.match_status || null,
      theirMatchStatus: theirMatch?.match_status || null
    })

  } catch (error) {
    console.error('检查匹配状态时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}