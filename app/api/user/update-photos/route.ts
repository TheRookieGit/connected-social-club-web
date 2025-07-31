import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

export async function PUT(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '缺少必要的环境变量',
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

    const { photos, deletedPhotos } = await request.json()

    if (!Array.isArray(photos)) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: '照片数据格式错误',
          code: 'INVALID_PHOTOS_FORMAT'
        }),
        { status: 400, headers: createNoCacheHeaders() }
      )
    }

    console.log('更新用户照片，用户ID:', decoded.userId)
    console.log('新照片顺序:', photos)
    console.log('删除的照片:', deletedPhotos)

    // 更新用户照片
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        photos: photos,
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

    // 如果有删除的照片，从存储中删除文件
    if (deletedPhotos && Array.isArray(deletedPhotos) && deletedPhotos.length > 0) {
      console.log('开始删除存储中的照片文件...')
      
      for (const photoUrl of deletedPhotos) {
        try {
          // 从URL中提取文件路径
          const urlParts = photoUrl.split('/')
          const fileName = urlParts[urlParts.length - 1]
          const userId = decoded.userId
          const filePath = `${userId}/${fileName}`

          console.log('删除文件:', filePath)

          const { error: deleteError } = await supabase.storage
            .from('user-photos')
            .remove([filePath])

          if (deleteError) {
            console.error('删除文件失败:', filePath, deleteError)
            // 不中断流程，继续处理其他文件
          } else {
            console.log('成功删除文件:', filePath)
          }
        } catch (error) {
          console.error('删除文件异常:', photoUrl, error)
        }
      }
    }

    // 记录活动日志
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: decoded.userId,
        activity_type: 'photos_reorder',
        activity_data: { 
          photo_count: photos.length,
          deleted_photos: deletedPhotos || [],
          timestamp: new Date().toISOString()
        }
      })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '照片更新成功',
        photos: photos,
        photo_count: photos.length,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: createNoCacheHeaders()
      }
    )

  } catch (error) {
    console.error('更新照片处理错误:', error)
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