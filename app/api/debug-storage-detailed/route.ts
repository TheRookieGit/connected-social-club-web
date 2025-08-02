import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始详细调试存储桶状态...')
    
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库连接失败' 
      })
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      envCheck: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置'
      },
      tests: {}
    }

    // 测试 1: 基本连接
    console.log('🧪 测试 1: 基本连接...')
    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      results.tests.basicConnection = {
        success: !testError,
        error: testError?.message || null
      }
    } catch (error) {
      results.tests.basicConnection = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    // 测试 2: 存储桶列表
    console.log('🧪 测试 2: 存储桶列表...')
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      results.tests.bucketList = {
        success: !listError,
        error: listError?.message || null,
        buckets: buckets || [],
        count: buckets?.length || 0
      }
    } catch (error) {
      results.tests.bucketList = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        buckets: [],
        count: 0
      }
    }

    // 测试 3: 直接查询存储桶表
    console.log('🧪 测试 3: 直接查询存储桶表...')
    try {
      const { data: bucketData, error: bucketError } = await supabase
        .from('storage.buckets')
        .select('*')
      
      results.tests.directBucketQuery = {
        success: !bucketError,
        error: bucketError?.message || null,
        buckets: bucketData || []
      }
    } catch (error) {
      results.tests.directBucketQuery = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        buckets: []
      }
    }

    // 测试 4: 检查存储策略
    console.log('🧪 测试 4: 检查存储策略...')
    try {
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage')
      
      results.tests.storagePolicies = {
        success: !policyError,
        error: policyError?.message || null,
        policies: policies || [],
        photoPolicies: policies?.filter(p => p.policyname?.includes('photos')) || []
      }
    } catch (error) {
      results.tests.storagePolicies = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        policies: [],
        photoPolicies: []
      }
    }

    // 测试 5: 尝试创建测试存储桶
    console.log('🧪 测试 5: 尝试创建测试存储桶...')
    try {
      const testBucketName = `test-bucket-${Date.now()}`
      const { data: createData, error: createError } = await supabase.storage.createBucket(testBucketName, {
        public: true,
        fileSizeLimit: 1024 * 1024 // 1MB
      })
      
      results.tests.createBucket = {
        success: !createError,
        error: createError?.message || null,
        bucketName: testBucketName,
        created: createData || null
      }

      // 如果创建成功，尝试删除（注意：Supabase可能不支持删除存储桶）
      if (!createError) {
        try {
          // 尝试删除存储桶，但可能不支持
          const { error: deleteError } = await supabase.storage.deleteBucket(testBucketName)
          results.tests.createBucket.deleted = !deleteError
          results.tests.createBucket.deleteError = deleteError?.message || null
        } catch (deleteError) {
          results.tests.createBucket.deleted = false
          results.tests.createBucket.deleteError = '删除存储桶功能可能不支持'
        }
      }
    } catch (error) {
      results.tests.createBucket = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }

    // 分析结果
    const analysis = {
      canConnect: results.tests.basicConnection?.success || false,
      canListBuckets: results.tests.bucketList?.success || false,
      canCreateBuckets: results.tests.createBucket?.success || false,
      hasBuckets: (results.tests.bucketList?.count || 0) > 0,
      hasPhotoPolicies: (results.tests.storagePolicies?.photoPolicies?.length || 0) > 0
    }

    results.analysis = analysis

    // 提供建议
    let suggestions = []
    if (!analysis.canConnect) {
      suggestions.push('数据库连接失败，请检查环境变量')
    }
    if (!analysis.canListBuckets) {
      suggestions.push('无法列出存储桶，可能是权限问题')
    }
    if (!analysis.canCreateBuckets) {
      suggestions.push('无法创建存储桶，需要管理员权限')
    }
    if (!analysis.hasBuckets) {
      suggestions.push('没有找到任何存储桶，需要创建 user-photos 存储桶')
    }
    if (!analysis.hasPhotoPolicies) {
      suggestions.push('没有找到照片相关的存储策略')
    }

    results.suggestions = suggestions

    return NextResponse.json({
      success: true,
      message: '详细诊断完成',
      results
    })

  } catch (error) {
    console.error('❌ 详细调试过程中出错:', error)
    return NextResponse.json({
      success: false,
      error: '详细调试过程中出错',
      details: error instanceof Error ? error.message : String(error)
    })
  }
} 