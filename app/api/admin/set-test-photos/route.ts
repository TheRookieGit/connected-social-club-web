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

    // 为测试用户设置照片
    const testPhotos = {
      'test@example.com': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop'
      ],
      'admin@socialclub.com': [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop', // 猫的照片
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=600&fit=crop'  // 另一张猫的照片
      ]
    }

    const results = []

    for (const [email, photos] of Object.entries(testPhotos)) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .single()

      if (userError || !user) {
        console.error(`找不到用户 ${email}:`, userError)
        results.push({ email, success: false, error: '用户不存在' })
        continue
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          photos: photos,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error(`更新用户 ${email} 照片失败:`, updateError)
        results.push({ email, success: false, error: updateError.message })
      } else {
        console.log(`✅ 成功为用户 ${user.name} (${email}) 设置照片`)
        results.push({ 
          email, 
          success: true, 
          user_id: user.id,
          photo_count: photos.length,
          photos: photos
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '测试照片设置完成',
      results: results
    })

  } catch (error) {
    console.error('设置测试照片错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 