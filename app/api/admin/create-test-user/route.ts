import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: '数据库连接失败' },
        { status: 500 }
      )
    }

    const { email, password, name, phone, birth_date, gender } = await request.json()

    // 验证必需字段
    if (!email || !password || !name || !phone || !birth_date || !gender) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建新用户
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        phone,
        birth_date,
        gender,
        is_verified: true,
        status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('创建用户错误:', createError)
      return NextResponse.json(
        { success: false, error: '创建用户失败', details: createError.message },
        { status: 500 }
      )
    }

    // 创建用户偏好设置
    await supabase
      .from('user_preferences')
      .insert({
        user_id: newUser.id,
        min_age: 18,
        max_age: 99,
        preferred_gender: [gender === 'male' ? 'female' : 'male'],
        max_distance: 50
      })

    return NextResponse.json({
      success: true,
      message: '测试用户创建成功',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        birth_date: newUser.birth_date,
        gender: newUser.gender
      }
    })

  } catch (error) {
    console.error('创建测试用户错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 