import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: '缺少必要的环境变量',
          details: {
            supabaseUrl: supabaseUrl ? '已设置' : '未设置',
            supabaseServiceKey: supabaseServiceKey ? '已设置' : '未设置'
          }
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 测试1: 列出所有存储桶
    console.log('测试1: 列出存储桶...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: '无法列出存储桶',
          details: listError
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    // 测试2: 检查user-photos存储桶
    const userPhotosBucket = buckets?.find(bucket => bucket.name === 'user-photos')
    
    if (!userPhotosBucket) {
      // 尝试创建user-photos存储桶
      console.log('创建user-photos存储桶...')
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('user-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })

      if (createError) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: '无法创建user-photos存储桶',
            details: createError,
            existingBuckets: buckets?.map(b => b.name) || []
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
          }
        )
      }

      return new NextResponse(
        JSON.stringify({
          success: true,
          message: 'user-photos存储桶创建成功',
          data: {
            bucket: newBucket,
            totalBuckets: (buckets?.length || 0) + 1,
            bucketNames: [...(buckets?.map(b => b.name) || []), 'user-photos']
          },
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    // 测试3: 检查存储桶权限
    console.log('测试3: 检查存储桶权限...')
    const { data: bucketInfo, error: infoError } = await supabase.storage.getBucket('user-photos')

    if (infoError) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: '无法获取存储桶信息',
          details: infoError
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    // 测试4: 列出存储桶中的文件
    console.log('测试4: 列出存储桶文件...')
    const { data: files, error: filesError } = await supabase.storage
      .from('user-photos')
      .list('', { limit: 10 })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '存储服务测试成功',
        data: {
          bucket: bucketInfo,
          totalBuckets: buckets?.length || 0,
          bucketNames: buckets?.map(b => b.name) || [],
          files: files || [],
          fileCount: files?.length || 0
        },
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )

  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: '存储测试执行失败',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )
  }
} 