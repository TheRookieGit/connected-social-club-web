import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

// 禁用静态生成和缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// 验证 JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader) {
    console.error('❌ Authorization header 不存在')
    return null
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.error('❌ Authorization header 格式错误，应该以 "Bearer " 开头')
    return null
  }

  const token = authHeader.substring(7)
  console.log('🔍 Token 长度:', token.length)
  console.log('🔍 Token 前缀:', token.substring(0, 20) + '...')
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    console.log('🔍 JWT_SECRET 长度:', jwtSecret.length)
    
    const decoded = jwt.verify(token, jwtSecret) as any
    console.log('✅ Token 验证成功，解码结果:', { userId: decoded.userId, email: decoded.email })
    return decoded
  } catch (error) {
    console.error('❌ Token验证失败:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('❌ JWT错误类型:', error.name)
      console.error('❌ JWT错误消息:', error.message)
    }
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
    console.log('🔍 开始处理照片上传请求...')
    
    // 检查是否是测试请求
    const url = new URL(request.url)
    if (url.searchParams.get('test') === 'true') {
      console.log('🧪 收到测试请求')
      return new NextResponse(
        JSON.stringify({ 
          success: true, 
          message: 'API正常工作',
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: createNoCacheHeaders() }
      )
    }
    
    // 使用 Service Role Key 创建管理员客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔍 环境变量检查:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '已设置' : '未设置')
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ 缺少必要的环境变量')
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
    if (!supabase) {
      console.error('❌ Supabase客户端创建失败')
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '数据库连接失败',
          details: '无法创建数据库客户端',
          code: 'SUPABASE_CLIENT_ERROR'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      console.error('❌ Token验证失败')
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '未授权访问',
          details: 'Token验证失败，请检查登录状态',
          code: 'AUTH_FAILED'
        }),
        { status: 401, headers: createNoCacheHeaders() }
      )
    }

    console.log('✅ Token验证成功，用户ID:', decoded.userId)
    console.log('开始处理照片上传（管理员模式），用户ID:', decoded.userId)

    // 解析FormData
    let formData
    try {
      formData = await request.formData()
    } catch (formDataError) {
      console.error('❌ FormData解析失败:', formDataError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '请求格式错误',
          details: '无法解析上传的文件数据',
          code: 'FORM_DATA_ERROR'
        }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    const photos = formData.getAll('photos') as File[]
    
    if (!photos || photos.length === 0) {
      console.error('❌ 没有接收到照片文件')
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '没有接收到照片文件',
          details: '请选择要上传的照片',
          code: 'NO_PHOTOS'
        }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    console.log('接收到照片数量:', photos.length)

    // 首先获取用户现有的照片
    let existingUser
    try {
      const { data, error: fetchError } = await supabase
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
      existingUser = data
    } catch (fetchError) {
      console.error('获取用户现有照片异常:', fetchError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '获取用户照片失败',
          details: '数据库查询异常',
          code: 'FETCH_USER_EXCEPTION'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    // 获取现有照片数组，如果为空则初始化为空数组
    const existingPhotos = existingUser?.photos || []
    console.log('用户现有照片数量:', existingPhotos.length)

    // 检查存储桶是否存在，如果不存在则创建
    console.log('检查用户照片存储桶...')
    let buckets
    try {
      const { data, error: listError } = await supabase.storage.listBuckets()
      
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
      buckets = data
    } catch (listError) {
      console.error('获取存储桶列表异常:', listError)
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '存储服务连接失败',
          details: '无法连接到存储服务',
          code: 'STORAGE_CONNECTION_ERROR'
        }),
        { status: 500, headers: createNoCacheHeaders() }
      )
    }

    let userPhotosBucket: any = buckets?.find(bucket => bucket.name === 'user-photos')
    
    if (!userPhotosBucket) {
      console.log('创建用户照片存储桶...')
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

    console.log('存储桶检查通过:', userPhotosBucket.name)

    const uploadedPhotoUrls: string[] = []

    // 验证每张照片
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

      // 验证文件大小（4MB限制，留余量给Vercel）
      const maxSize = 4 * 1024 * 1024 // 4MB
      if (photo.size > maxSize) {
        console.error(`文件过大: ${photo.size} bytes (${(photo.size / 1024 / 1024).toFixed(2)}MB)`)
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: '文件过大',
            details: `照片 ${i + 1} 大小 ${(photo.size / 1024 / 1024).toFixed(2)}MB，超过4MB限制`,
            code: 'FILE_TOO_LARGE'
          }),
          { status: 400, headers: createNoCacheHeaders() }
        )
      }

      console.log(`照片 ${i + 1} 验证通过: ${photo.name}, ${(photo.size / 1024 / 1024).toFixed(2)}MB`)
    }

    // 上传每张照片
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
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
          total_photos: allPhotos.length,
          timestamp: new Date().toISOString()
        }
      })

    console.log('照片上传完成，成功上传:', uploadedPhotoUrls.length, '张，总照片数:', allPhotos.length)

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '照片上传成功（管理员模式）',
        photos: uploadedPhotoUrls,
        photo_count: uploadedPhotoUrls.length,
        total_photos: allPhotos.length,
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