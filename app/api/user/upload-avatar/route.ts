import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 强制动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function createNoCacheHeaders() {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
    'Vercel-Cache-Control': 'no-cache, no-store, must-revalidate',
    'X-Vercel-Cache': 'MISS',
    'X-Accel-Expires': '0',
    'X-Proxy-Cache': 'BYPASS',
    'Last-Modified': new Date().toUTCString(),
    'ETag': `"${Date.now()}-${Math.random()}"`,
    'X-SW-Cache': 'no-cache',
    'X-Timestamp': Date.now().toString(),
    'X-Server-Time': new Date().toISOString()
  }
}

function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '数据库连接失败' }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '未授权访问' }),
        { 
          status: 401,
          headers: createNoCacheHeaders()
        }
      )
    }

    console.log('头像上传请求，用户ID:', decoded.userId, '时间:', new Date().toISOString())

    // 获取FormData
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '没有上传文件' }),
        { 
          status: 400,
          headers: createNoCacheHeaders()
        }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '只支持 JPEG、PNG 和 WebP 格式的图片' }),
        { 
          status: 400,
          headers: createNoCacheHeaders()
        }
      )
    }

    // 验证文件大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '文件大小不能超过 5MB' }),
        { 
          status: 400,
          headers: createNoCacheHeaders()
        }
      )
    }

    // 生成唯一的文件名
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatars/${decoded.userId}/${timestamp}-${randomId}.${fileExtension}`

    console.log('准备上传文件:', fileName, '大小:', file.size, '类型:', file.type)

    // 检查存储桶是否存在
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.error('获取存储桶列表失败:', bucketError)
      return new NextResponse(
        JSON.stringify({ success: false, error: '存储桶访问失败', details: bucketError.message }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    const userAvatarsBucket = buckets?.find(b => b.id === 'user-avatars')
    if (!userAvatarsBucket) {
      console.error('user-avatars存储桶不存在')
      return new NextResponse(
        JSON.stringify({ success: false, error: '存储桶不存在，请先设置Supabase Storage' }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    console.log('存储桶信息:', userAvatarsBucket)

    // 上传文件到Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('文件上传失败:', uploadError)
      console.error('上传错误详情:', {
        message: uploadError.message,
        name: uploadError.name
      })
      
      // 提供更详细的错误信息
      let errorMessage = '文件上传失败'
      if (uploadError.message.includes('bucket')) {
        errorMessage = '存储桶配置错误，请检查Supabase Storage设置'
      } else if (uploadError.message.includes('policy')) {
        errorMessage = '存储权限错误，请检查存储策略设置'
      } else if (uploadError.message.includes('unauthorized')) {
        errorMessage = '权限验证失败，请重新登录'
      }
      
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: errorMessage, 
          details: uploadError.message
        }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    console.log('文件上传成功:', uploadData)

    // 获取文件的公共URL
    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(fileName)

    const avatarUrl = urlData.publicUrl

    console.log('生成的公共URL:', avatarUrl)

    // 更新用户资料中的头像URL
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId)
      .select()
      .single()

    if (updateError) {
      console.error('更新用户头像失败:', updateError)
      // 如果更新失败，删除已上传的文件
      await supabase.storage
        .from('user-avatars')
        .remove([fileName])
      
      return new NextResponse(
        JSON.stringify({ success: false, error: '更新头像失败', details: updateError.message }),
        { 
          status: 500,
          headers: createNoCacheHeaders()
        }
      )
    }

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'avatar_upload',
        activity_data: { 
          file_name: fileName,
          file_size: file.size,
          file_type: file.type,
          avatar_url: avatarUrl,
          timestamp: new Date().toISOString()
        }
      })

    // 创建响应数据
    const responseData = {
      success: true,
      message: '头像上传成功',
      timestamp: new Date().toISOString(),
      server_time: Date.now(),
      upload_id: `upload-${timestamp}-${randomId}`,
      avatar_url: avatarUrl,
      user: {
        ...updatedUser,
        avatar_uploaded_at: new Date().toISOString(),
        upload_confirmed: true
      }
    }

    return new NextResponse(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: createNoCacheHeaders()
      }
    )

  } catch (error) {
    console.error('头像上传错误:', error)
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: '服务器错误', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: createNoCacheHeaders()
      }
    )
  }
} 