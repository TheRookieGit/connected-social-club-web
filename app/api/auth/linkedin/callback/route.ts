import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from '@/lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?error=linkedin_auth_failed`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?error=no_code`)
  }

  try {
    // 创建Supabase客户端
    const supabase = createSupabaseClient()

    // 1. 用code交换access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/api/auth/linkedin/callback',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error('No access token received')
    }

    // 2. 用access token获取用户信息
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    console.log('LinkedIn用户数据:', userData)

    // 3. 检查用户是否已存在，如果不存在则创建
    let user
    
    // 先用邮箱查找用户
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      // 用户已存在，更新LinkedIn信息
      console.log('用户已存在，更新信息:', existingUser)
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          avatar_url: userData.picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('更新用户信息失败:', updateError)
        throw new Error('Failed to update user')
      }
      
      user = updatedUser
    } else {
      // 创建新用户 - 使用正确的数据库字段
      console.log('创建新用户:', userData)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: 'linkedin_oauth', // LinkedIn用户不需要密码，设置占位符
          name: userData.name,
          avatar_url: userData.picture,
          birth_date: '1990-01-01', // 默认生日，用户稍后可以更新
          gender: 'other', // 默认值
          location: '未设置',
          bio: '通过LinkedIn加入的用户',
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('创建用户失败:', createError)
        throw new Error('Failed to create user')
      }
      
      user = newUser
    }

    console.log('最终用户信息:', user)

    // 4. 生成JWT token，使用数据库中的用户ID
    const token = jwt.sign(
      { 
        userId: user.id, // 使用数据库中的数字ID
        email: user.email,
        name: user.name,
        provider: 'linkedin'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 5. 重定向到dashboard，并在URL中包含token
    const redirectUrl = new URL('/dashboard', process.env.NEXTAUTH_URL || 'http://localhost:3000')
    redirectUrl.searchParams.append('token', token)
    redirectUrl.searchParams.append('user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      provider: 'linkedin'
    }))

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('LinkedIn auth error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?error=linkedin_auth_error`)
  }
} 