import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
        jwt_secret: process.env.JWT_SECRET ? '已设置' : '未设置'
      },
      tests: {
        anon_client: null as any,
        service_client: null as any,
        bucket_check: null as any
      },
      errors: [] as string[]
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // 测试1: 使用anon key创建客户端
    if (supabaseUrl && anonKey) {
      try {
        const anonClient = createClient(supabaseUrl, anonKey)
        const { data: anonBuckets, error: anonError } = await anonClient.storage.listBuckets()
        
        if (anonError) {
          results.tests.anon_client = `错误: ${anonError.message}`
        } else {
          results.tests.anon_client = `成功: 找到 ${anonBuckets?.length || 0} 个bucket`
        }
      } catch (error) {
        results.tests.anon_client = `异常: ${error}`
        results.errors.push(`Anon客户端错误: ${error}`)
      }
    } else {
      results.tests.anon_client = '环境变量缺失'
    }

    // 测试2: 使用service role key创建客户端
    if (supabaseUrl && serviceKey) {
      try {
        const serviceClient = createClient(supabaseUrl, serviceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        })
        
        const { data: serviceBuckets, error: serviceError } = await serviceClient.storage.listBuckets()
        
        if (serviceError) {
          results.tests.service_client = `错误: ${serviceError.message}`
        } else {
          results.tests.service_client = `成功: 找到 ${serviceBuckets?.length || 0} 个bucket`
          
          // 检查user-avatars bucket
          const userAvatarsBucket = serviceBuckets?.find((b: any) => b.id === 'user-avatars')
          if (userAvatarsBucket) {
            results.tests.bucket_check = {
              exists: true,
              details: {
                id: userAvatarsBucket.id,
                name: userAvatarsBucket.name,
                public: userAvatarsBucket.public,
                file_size_limit: userAvatarsBucket.file_size_limit,
                allowed_mime_types: userAvatarsBucket.allowed_mime_types
              }
            }
          } else {
            results.tests.bucket_check = {
              exists: false,
              available_buckets: serviceBuckets?.map((b: any) => b.id) || []
            }
          }
        }
      } catch (error) {
        results.tests.service_client = `异常: ${error}`
        results.errors.push(`Service客户端错误: ${error}`)
      }
    } else {
      results.tests.service_client = 'Service role key未设置'
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