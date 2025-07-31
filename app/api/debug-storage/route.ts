import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 开始调试存储桶状态...')
    
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库连接失败' 
      })
    }

    // 检查环境变量
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置'
    }

    console.log('📋 环境变量检查:', envCheck)

    // 列出所有存储桶
    console.log('📦 获取存储桶列表...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ 获取存储桶列表失败:', listError)
      return NextResponse.json({ 
        success: false, 
        error: '获取存储桶列表失败',
        details: listError.message,
        envCheck
      })
    }

    console.log('✅ 存储桶列表:', buckets)

    // 查找 user-photos 存储桶
    const userPhotosBucket = buckets?.find(bucket => bucket.name === 'user-photos')
    
    if (userPhotosBucket) {
      console.log('✅ 找到 user-photos 存储桶:', userPhotosBucket)
      
      // 尝试获取存储桶详细信息
      const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('user-photos')
      
      if (bucketError) {
        console.error('❌ 获取存储桶信息失败:', bucketError)
      }

      // 检查存储策略
      console.log('🔐 检查存储策略...')
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage')
        .like('policyname', '%photos%')

      return NextResponse.json({
        success: true,
        message: '存储桶状态检查完成',
        envCheck,
        buckets: buckets?.map(b => ({ name: b.name, public: b.public })),
        userPhotosBucket: {
          found: true,
          details: userPhotosBucket,
          bucketInfo: bucketError ? null : bucketInfo,
          policies: policyError ? null : policies
        },
        totalBuckets: buckets?.length || 0
      })

    } else {
      console.error('❌ 未找到 user-photos 存储桶')
      return NextResponse.json({
        success: false,
        error: '未找到 user-photos 存储桶',
        envCheck,
        availableBuckets: buckets?.map(b => b.name) || [],
        totalBuckets: buckets?.length || 0,
        suggestion: '请在 Supabase 控制台中创建 user-photos 存储桶，或运行 setup_user_photos_storage_auto.sql 脚本'
      })
    }

  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
    return NextResponse.json({
      success: false,
      error: '调试过程中出错',
      details: error instanceof Error ? error.message : String(error)
    })
  }
} 