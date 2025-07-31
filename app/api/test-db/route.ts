import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const testType = url.searchParams.get('test')

    if (testType === 'env') {
      // 环境变量检查
      const envCheck = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
        JWT_SECRET: process.env.JWT_SECRET ? '已设置' : '未设置',
        NODE_ENV: process.env.NODE_ENV || '未设置',
        VERCEL_ENV: process.env.VERCEL_ENV || '未设置',
        VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID || '未设置'
      }

      return new NextResponse(
        JSON.stringify({
          success: true,
          test: 'environment_variables',
          data: envCheck,
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

    if (testType === 'supabase') {
      // Supabase连接测试
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            test: 'supabase_connection',
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

      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        // 测试数据库连接
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1)

        if (testError) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              test: 'supabase_connection',
              error: '数据库连接失败',
              details: testError
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

        // 测试存储服务
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets()

        return new NextResponse(
          JSON.stringify({
            success: true,
            test: 'supabase_connection',
            data: {
              database: '连接正常',
              storage: storageError ? '连接失败' : '连接正常',
              storageError: storageError ? storageError.message : null,
              buckets: buckets ? buckets.length : 0
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
            test: 'supabase_connection',
            error: 'Supabase客户端创建失败',
            details: error instanceof Error ? error.message : String(error)
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

    // 默认测试
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '测试API正常工作',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
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
        error: '测试执行失败',
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