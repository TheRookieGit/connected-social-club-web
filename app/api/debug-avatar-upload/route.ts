import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
        jwt_secret: process.env.JWT_SECRET ? '已设置' : '未设置'
      },
      supabase_connection: null as any,
      storage_bucket: null as any,
      storage_policies: null as any,
      user_table: null as any,
      errors: [] as string[]
    }

    // 测试Supabase连接
    try {
      if (!supabase) {
        results.errors.push('Supabase客户端创建失败')
      } else {
        results.supabase_connection = '连接成功'
        
        // 检查存储桶
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
        if (bucketError) {
          results.errors.push(`存储桶列表错误: ${bucketError.message}`)
        } else {
          const userAvatarsBucket = buckets?.find(b => b.id === 'user-avatars')
          results.storage_bucket = userAvatarsBucket ? {
            id: userAvatarsBucket.id,
            name: userAvatarsBucket.name,
            public: userAvatarsBucket.public,
            file_size_limit: userAvatarsBucket.file_size_limit,
            allowed_mime_types: userAvatarsBucket.allowed_mime_types
          } : '存储桶不存在'
        }

        // 检查用户表
        const { data: userColumns, error: userError } = await supabase
          .from('users')
          .select('avatar_url')
          .limit(1)
        
        if (userError) {
          results.errors.push(`用户表查询错误: ${userError.message}`)
        } else {
          results.user_table = '用户表可访问，avatar_url字段存在'
        }

        // 尝试上传一个测试文件
        try {
          const testFile = new Blob(['test'], { type: 'text/plain' })
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('user-avatars')
            .upload('test/test.txt', testFile, {
              upsert: true
            })
          
          if (uploadError) {
            results.errors.push(`测试上传失败: ${uploadError.message}`)
          } else {
            results.errors.push('测试上传成功')
            // 删除测试文件
            await supabase.storage
              .from('user-avatars')
              .remove(['test/test.txt'])
          }
        } catch (uploadTestError) {
          results.errors.push(`测试上传异常: ${uploadTestError}`)
        }
      }
    } catch (connectionError) {
      results.errors.push(`连接测试失败: ${connectionError}`)
    }

    return NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: '调试失败',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  }
} 