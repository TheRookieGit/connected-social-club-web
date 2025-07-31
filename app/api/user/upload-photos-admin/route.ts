import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

// 禁用静态生成和缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// 验证 JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch (error) {
    console.error('Token验证失败:', error)
    return null
  }
}

// 创建强化的缓存控制头
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
    'X-Vercel-ID': process.env.VERCEL_DEPLOYMENT_ID || 'local',
    'X-Accel-Expires': '0',
    'X-Proxy-Cache': 'BYPASS',
    'Last-Modified': new Date().toUTCString(),
    'ETag': `"${Date.now()}-${Math.random()}"`,
    'X-SW-Cache': 'no-cache',
    'X-Timestamp': Date.now().toString(),
    'X-Server-Time': new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    // 使用 Service Role Key 创建管理员客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '缺少必要的环境变量' }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '未授权访问' }),
        { status: 401, headers: createNoCacheHeaders() }
      )
    }

    console.log('开始处理照片上传（管理员模式），用户ID:', decoded.userId)

    const formData = await request.formData()
    const photos = formData.getAll('photos') as File[]
    
    if (!photos || photos.length === 0) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '没有接收到照片文件' }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    console.log('接收到照片数量:', photos.length)

    // 检查存储桶是否存在，如果不存在则创建
    console.log('检查用户照片存储桶...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('获取存储桶列表失败:', listError)
      return new NextResponse(
        JSON.stringify({ success: false, error: '无法访问存储服务', details: listError.message }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    let userPhotosBucket = buckets?.find(bucket => bucket.name === 'user-photos')
    
    if (!userPhotosBucket) {
      console.log('创建用户照片存储桶...')
      const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('user-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })
      
      if (bucketError) {
        console.error('创建存储桶失败:', bucketError)
        return new NextResponse(
          JSON.stringify({ success: false, error: '存储桶创建失败', details: bucketError.message }),
          { status: 500, headers: createNoCacheHeaders() }
        )
      }
      
      userPhotosBucket = newBucket
      console.log('存储桶创建成功:', newBucket)
    } else {
      console.log('存储桶已存在:', userPhotosBucket.name)
    }

    const uploadedPhotoUrls: string[] = []

    // 上传每张照片
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
      if (!photo || photo.size === 0) {
        console.log(`跳过空照片 ${i}`)
        continue
      }

      // 验证文件类型
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(photo.type)) {
        console.error(`不支持的文件类型: ${photo.type}`)
        continue
      }

      // 验证文件大小（5MB限制）
      if (photo.size > 5 * 1024 * 1024) {
        console.error(`文件过大: ${photo.size} bytes`)
        continue
      }

      // 生成唯一文件名
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const fileExtension = photo.name.split('.').pop() || 'jpg'
      const fileName = `${decoded.userId}/${timestamp}-${randomId}.${fileExtension}`

      console.log(`上传照片 ${i + 1}/${photos.length}: ${fileName}`)

      try {
        // 上传文件到Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(fileName, photo, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error(`照片 ${i + 1} 上传失败:`, uploadError)
          continue
        }

        // 获取文件的公共URL
        const { data: urlData } = supabase.storage
          .from('user-photos')
          .getPublicUrl(fileName)

        uploadedPhotoUrls.push(urlData.publicUrl)
        console.log(`照片 ${i + 1} 上传成功:`, urlData.publicUrl)

      } catch (error) {
        console.error(`照片 ${i + 1} 上传异常:`, error)
        continue
      }
    }

    if (uploadedPhotoUrls.length === 0) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '没有照片上传成功' }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    // 更新用户资料中的照片URL
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        photos: uploadedPhotoUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId)
      .select()
      .single()

    if (updateError) {
      console.error('更新用户照片失败:', updateError)
      return new NextResponse(
        JSON.stringify({ success: false, error: '更新用户照片失败' }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'photos_upload',
        activity_data: { 
          photo_count: uploadedPhotoUrls.length,
          photo_urls: uploadedPhotoUrls,
          timestamp: new Date().toISOString()
        }
      })

    console.log('照片上传完成，成功上传:', uploadedPhotoUrls.length, '张')

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '照片上传成功（管理员模式）',
        photos: uploadedPhotoUrls,
        photo_count: uploadedPhotoUrls.length,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: createNoCacheHeaders()
      }
    )

  } catch (error) {
    console.error('照片上传处理错误:', error)
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