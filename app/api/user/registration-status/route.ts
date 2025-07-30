import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token无效' },
        { status: 401 }
      )
    }

    // 获取用户资料
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查各个注册步骤
    const hasBasicInfo = user.gender && user.birth_date
    const hasInterests = user.interests && user.interests.length > 0
    const hasValues = (user.values_preferences && user.values_preferences.length > 0)
    const hasLifestyle = user.smoking_status && user.drinking_status
    const hasFamilyPlans = user.family_plans !== null && user.family_plans !== undefined
    const hasDatingGoals = user.dating_style !== null && user.dating_style !== undefined
    
    const isComplete = hasBasicInfo && hasInterests && hasValues && hasLifestyle && hasFamilyPlans && hasDatingGoals
    
    // 确定下一步应该去哪里
    let nextStep = ''
    if (isComplete) {
      nextStep = '/dashboard'
    } else if (!user.gender) {
      nextStep = '/gender-selection'
    } else if (!user.birth_date) {
      nextStep = '/age-selection'
    } else if (!hasInterests) {
      nextStep = '/interests'
    } else if (!hasValues) {
      nextStep = '/values'
    } else if (!hasLifestyle) {
      nextStep = '/lifestyle'
    } else if (!hasDatingGoals) {
      nextStep = '/dating-goals'
    } else if (!hasFamilyPlans) {
      nextStep = '/family-plans'
    }

    return NextResponse.json({
      success: true,
      isComplete,
      nextStep,
      status: {
        hasBasicInfo,
        hasInterests,
        hasValues,
        hasLifestyle,
        hasFamilyPlans,
        hasDatingGoals
      }
    })

  } catch (error) {
    console.error('检查注册状态错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 