import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: '环境变量缺失',
        supabaseUrl: supabaseUrl ? '已设置' : '未设置',
        supabaseKey: supabaseKey ? '已设置' : '未设置',
        serviceRoleKey: serviceRoleKey ? '已设置' : '未设置'
      }, { status: 500 })
    }

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 测试连接
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

    if (bucketError) {
      return NextResponse.json({
        error: '获取存储桶失败',
        details: bucketError.message
      }, { status: 500 })
    }

    // 查找user-avatars存储桶
    const userAvatarsBucket = buckets?.find(b => b.id === 'user-avatars')

    if (!userAvatarsBucket) {
      return NextResponse.json({
        error: 'user-avatars存储桶不存在',
        availableBuckets: buckets?.map(b => b.id) || []
      }, { status: 404 })
    }

    // 测试上传权限
    const testFile = new Blob(['test'], { type: 'text/plain' })
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload('test/test.txt', testFile, {
        upsert: true
      })

    if (uploadError) {
      return NextResponse.json({
        error: '测试上传失败',
        details: uploadError.message,
        bucket: userAvatarsBucket
      }, { status: 500 })
    }

    // 删除测试文件
    await supabase.storage
      .from('user-avatars')
      .remove(['test/test.txt'])

    return NextResponse.json({
      success: true,
      message: '存储测试成功',
      bucket: userAvatarsBucket,
      uploadTest: '通过'
    })

  } catch (error) {
    return NextResponse.json({
      error: '测试失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 