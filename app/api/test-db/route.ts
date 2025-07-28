import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: '数据库连接失败' },
        { status: 500 }
      )
    }

    // 测试1: 检查数据库连接
    console.log('测试1: 检查数据库连接...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('数据库连接测试失败:', testError)
      return NextResponse.json(
        { success: false, error: '数据库连接测试失败', details: testError },
        { status: 500 }
      )
    }

    // 测试2: 检查用户表结构
    console.log('测试2: 检查用户表结构...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, bio, location, updated_at')
      .limit(5)

    if (userError) {
      console.error('用户表查询失败:', userError)
      return NextResponse.json(
        { success: false, error: '用户表查询失败', details: userError },
        { status: 500 }
      )
    }

    // 测试3: 检查bio字段是否存在
    console.log('测试3: 检查bio字段...')
    const usersWithBio = userData?.filter(user => user.bio !== null && user.bio !== undefined)
    const usersWithoutBio = userData?.filter(user => user.bio === null || user.bio === undefined)

    return NextResponse.json({
      success: true,
      message: '数据库测试成功',
      tests: {
        connection: '✅ 数据库连接正常',
        tableStructure: '✅ 用户表结构正常',
        bioField: `✅ bio字段存在 - 有bio的用户: ${usersWithBio?.length || 0}, 无bio的用户: ${usersWithoutBio?.length || 0}`
      },
      sampleUsers: userData?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        location: user.location,
        updated_at: user.updated_at
      })) || []
    })

  } catch (error) {
    console.error('数据库测试异常:', error)
    return NextResponse.json(
      { success: false, error: '数据库测试异常', details: error },
      { status: 500 }
    )
  }
} 