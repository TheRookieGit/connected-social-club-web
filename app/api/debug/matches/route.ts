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

// 获取所有匹配记录用于调试
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

    // 获取所有匹配记录
    const { data: allMatches, error: matchesError } = await supabase
      .from('user_matches')
      .select(`
        id,
        user_id,
        matched_user_id,
        match_status,
        match_score,
        created_at,
        user:user_id (name, email),
        matched_user:matched_user_id (name, email)
      `)
      .order('created_at', { ascending: false })

    if (matchesError) {
      console.error('获取匹配记录错误:', matchesError)
      return NextResponse.json(
        { success: false, error: '获取匹配记录失败' },
        { status: 500 }
      )
    }

    // 格式化数据
    const formattedMatches = allMatches?.map((match: any) => ({
      id: match.id,
      user: `${match.user?.name} (${match.user?.email})`,
      matchedUser: `${match.matched_user?.name} (${match.matched_user?.email})`,
      status: match.match_status,
      score: match.match_score,
      createdAt: match.created_at,
      userId: match.user_id,
      matchedUserId: match.matched_user_id
    })) || []

    // 获取当前用户的匹配记录
    const { data: currentUserMatches, error: currentUserError } = await supabase
      .from('user_matches')
      .select(`
        matched_user_id,
        match_status,
        matched_user:matched_user_id (name, email)
      `)
      .eq('user_id', decoded.userId)

    return NextResponse.json({
      success: true,
      allMatches: formattedMatches,
      currentUserMatches: currentUserMatches || [],
      totalMatches: formattedMatches.length,
      acceptedMatches: formattedMatches.filter(m => m.status === 'accepted').length,
      pendingMatches: formattedMatches.filter(m => m.status === 'pending').length,
      rejectedMatches: formattedMatches.filter(m => m.status === 'rejected').length,
      currentUserId: decoded.userId
    })

  } catch (error) {
    console.error('调试匹配记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 