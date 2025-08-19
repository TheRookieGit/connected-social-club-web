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
    // 检查是否需要自动创建存储桶
    const url = new URL(request.url)
    const shouldAutoCreate = url.searchParams.get('autoCreateBucket') === 'true'
    
    console.log('请求参数检查:', {
      autoCreateBucket: url.searchParams.get('autoCreateBucket'),
      shouldAutoCreate
    })

    // 使用 Service Role Key 创建管理员客户端（用于自动建桶）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '服务器配置错误',
          details: '缺少必要的环境变量配置',
          code: 'MISSING_ENV_VARS'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '未授权访问',
          code: 'AUTH_FAILED'
        }),
        { status: 401, headers: createNoCacheHeaders() }
      )
    }

    console.log('开始处理照片上传，用户ID:', decoded.userId)

    const formData = await request.formData()
    const photos = formData.getAll('photos') as File[]
    const forceAdminMode = formData.get('force_admin_mode') === '1'
    
    console.log('FormData检查:', {
      photoCount: photos.length,
      forceAdminMode
    })
    
    if (!photos || photos.length === 0) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '没有接收到照片文件',
          code: 'NO_PHOTOS'
        }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    console.log('接收到照片数量:', photos.length)

    // 检查存储桶是否存在
    console.log('检查用户照片存储桶...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('获取存储桶列表失败:', listError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '无法访问存储服务', 
          details: listError.message,
          code: 'STORAGE_LIST_ERROR'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    let userPhotosBucket = buckets?.find(bucket => bucket.name === 'user-photos')
    
    // 如果存储桶不存在且需要自动创建
    if (!userPhotosBucket && (shouldAutoCreate || forceAdminMode)) {
      console.log('存储桶不存在，开始自动创建...')
      
      try {
        const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('user-photos', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        })
        
        if (bucketError) {
          console.error('创建存储桶失败:', bucketError)
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              error: '存储桶创建失败', 
              details: bucketError.message,
              code: 'BUCKET_CREATE_ERROR'
            }),
            { status: 500, headers: createNoCacheHeaders() }
          )
        }
        
        userPhotosBucket = newBucket
        console.log('存储桶创建成功:', userPhotosBucket.name)
      } catch (bucketError) {
        console.error('创建存储桶异常:', bucketError)
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: '存储桶创建失败',
            details: '存储服务异常',
            code: 'BUCKET_CREATE_EXCEPTION'
          }),
          { status: 500, headers: createNoCacheHeaders() }
        )
      }
    }
    
    // 如果仍然没有存储桶，返回错误
    if (!userPhotosBucket) {
      console.error('user-photos 存储桶不存在')
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '存储桶不存在', 
          details: '请在 Supabase 控制台中手动创建 user-photos 存储桶，或使用自动创建参数',
          setup_guide: '请参考 SUPABASE_STORAGE_SETUP.md 文件',
          code: 'BUCKET_NOT_FOUND'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    console.log('存储桶检查通过:', userPhotosBucket.name)

    // 获取用户现有照片
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('photos')
      .eq('id', decoded.userId)
      .single()

    if (fetchError) {
      console.error('获取用户现有照片失败:', fetchError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '获取用户照片失败',
          details: fetchError.message,
          code: 'FETCH_USER_ERROR'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    const existingPhotos = existingUser?.photos || []
    console.log('用户现有照片数量:', existingPhotos.length)

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
        JSON.stringify({ 
          success: false, 
          error: '没有照片上传成功',
          code: 'NO_UPLOAD_SUCCESS'
        }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    // 合并现有照片和新上传的照片
    const allPhotos = [...existingPhotos, ...uploadedPhotoUrls]
    console.log('合并后的照片总数:', allPhotos.length)

    // 更新用户资料中的照片URL（追加而不是替换）
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        photos: allPhotos,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId)
      .select()
      .single()

    if (updateError) {
      console.error('更新用户照片失败:', updateError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '更新用户照片失败',
          details: updateError.message,
          code: 'UPDATE_ERROR'
        }),
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
          total_photos: allPhotos.length,
          auto_created_bucket: shouldAutoCreate || forceAdminMode,
          timestamp: new Date().toISOString()
        }
      })

    console.log('照片上传完成，成功上传:', uploadedPhotoUrls.length, '张，总照片数:', allPhotos.length)

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '照片上传成功',
        photos: uploadedPhotoUrls,
        photo_count: uploadedPhotoUrls.length,
        total_photos: allPhotos.length,
        bucket_created: shouldAutoCreate || forceAdminMode,
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
        details: error instanceof Error ? error.message : String(error),
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500,
        headers: createNoCacheHeaders() 
      }
    )
  }
}