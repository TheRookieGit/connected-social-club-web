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

    const { action } = await request.json() // action: 'create_pending', 'simulate_flow'

    // 获取当前用户和其他用户
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', decoded.userId)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取其他用户（排除当前用户）
    const { data: otherUsers } = await supabase
      .from('users')
      .select('id, name')
      .neq('id', decoded.userId)
      .eq('status', 'active')
      .limit(3)

    if (!otherUsers || otherUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到其他用户' },
        { status: 400 }
      )
    }

    const steps = []

    if (action === 'create_pending') {
      // 创建单向pending匹配
      const targetUser = otherUsers[0]
      
      steps.push(`🎯 步骤1: 模拟其他用户(${targetUser.name}, ID:${targetUser.id}) 喜欢当前用户(${currentUser.name}, ID:${currentUser.id})`)
      
      // 先清除可能存在的匹配记录
      await supabase
        .from('user_matches')
        .delete()
        .eq('user_id', targetUser.id)
        .eq('matched_user_id', currentUser.id)

      // 创建其他用户对当前用户的pending匹配
      const { data: pendingMatch, error: createError } = await supabase
        .from('user_matches')
        .insert({
          user_id: targetUser.id,
          matched_user_id: currentUser.id,
          match_status: 'pending',
          match_score: 0.8
        })
        .select()
        .single()

      if (createError) {
        steps.push(`❌ 错误: 创建pending匹配失败 - ${createError.message}`)
        return NextResponse.json({
          success: false,
          error: '创建pending匹配失败',
          steps
        })
      }

      steps.push(`✅ 步骤2: 成功创建pending匹配记录`)
      steps.push(`📋 匹配详情: ${JSON.stringify(pendingMatch, null, 2)}`)
      steps.push(`💡 现在当前用户(${currentUser.name})应该能在"待接受匹配"中看到来自${targetUser.name}的喜欢请求`)

      return NextResponse.json({
        success: true,
        message: `成功创建pending匹配：${targetUser.name} → ${currentUser.name}`,
        steps,
        pendingMatch,
        instruction: '请刷新页面，然后点击紫色时钟按钮查看待接受匹配'
      })

    } else if (action === 'simulate_flow') {
      // 模拟完整的匹配流程
      const userA = currentUser
      const userB = otherUsers[0]
      const userC = otherUsers[1] || otherUsers[0]

      steps.push(`🎯 开始模拟完整匹配流程`)
      steps.push(`👤 用户A: ${userA.name} (ID: ${userA.id}) - 当前登录用户`)
      steps.push(`👤 用户B: ${userB.name} (ID: ${userB.id})`)
      steps.push(`👤 用户C: ${userC.name} (ID: ${userC.id})`)

      // 清除现有匹配记录
      await supabase.from('user_matches').delete().or(
        `and(user_id.eq.${userA.id},matched_user_id.in.(${userB.id},${userC.id})),` +
        `and(user_id.in.(${userB.id},${userC.id}),matched_user_id.eq.${userA.id})`
      )

      steps.push(`🧹 清除了现有的匹配记录`)

      // 步骤1: 用户B喜欢用户A (创建pending)
      const { data: pendingB, error: errorB } = await supabase
        .from('user_matches')
        .insert({
          user_id: userB.id,
          matched_user_id: userA.id,
          match_status: 'pending',
          match_score: 0.85
        })
        .select()
        .single()

      if (errorB) {
        steps.push(`❌ 创建用户B→用户A的pending匹配失败: ${errorB.message}`)
      } else {
        steps.push(`💌 步骤1完成: ${userB.name} 喜欢了 ${userA.name} (pending状态)`)
      }

      // 步骤2: 用户C也喜欢用户A (创建另一个pending)
      if (userC.id !== userB.id) {
        const { data: pendingC, error: errorC } = await supabase
          .from('user_matches')
          .insert({
            user_id: userC.id,
            matched_user_id: userA.id,
            match_status: 'pending',
            match_score: 0.75
          })
          .select()
          .single()

        if (errorC) {
          steps.push(`❌ 创建用户C→用户A的pending匹配失败: ${errorC.message}`)
        } else {
          steps.push(`💌 步骤2完成: ${userC.name} 也喜欢了 ${userA.name} (pending状态)`)
        }
      }

      // 验证pending匹配
      const { data: pendingMatches } = await supabase
        .from('user_matches')
        .select('*')
        .eq('matched_user_id', userA.id)
        .eq('match_status', 'pending')

      steps.push(`📊 验证结果: 找到 ${pendingMatches?.length || 0} 个待接受的匹配`)
      if (pendingMatches && pendingMatches.length > 0) {
        pendingMatches.forEach((match, index) => {
          steps.push(`📋 待匹配 ${index + 1}: 用户ID ${match.user_id} → 用户ID ${match.matched_user_id} (分数: ${Math.round(match.match_score * 100)}%)`)
        })
      }

      steps.push(``)
      steps.push(`🎯 测试说明:`)
      steps.push(`1. 刷新页面`)
      steps.push(`2. 点击导航栏的紫色时钟按钮 🕐`)
      steps.push(`3. 您应该看到${pendingMatches?.length || 0}个待接受的匹配请求`)
      steps.push(`4. 可以选择接受或拒绝这些请求`)
      steps.push(`5. 接受后会变成双向匹配，可以在红色按钮中看到`)

      return NextResponse.json({
        success: true,
        message: `模拟完成：创建了 ${pendingMatches?.length || 0} 个pending匹配`,
        steps,
        pendingCount: pendingMatches?.length || 0,
        instruction: '请按照上述步骤测试pending匹配功能'
      })
    }

    return NextResponse.json({
      success: false,
      error: '无效的操作类型'
    })

  } catch (error) {
    console.error('测试pending流程错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 