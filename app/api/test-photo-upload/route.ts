import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '照片上传测试API正常工作',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 测试照片上传API被调用')
    
    const formData = await request.formData()
    const photos = formData.getAll('photos') as File[]
    
    return NextResponse.json({
      success: true,
      message: '测试照片上传成功',
      receivedFiles: photos.length,
      fileNames: photos.map(f => f.name),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('测试API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 