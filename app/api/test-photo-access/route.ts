import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const photoUrl = url.searchParams.get('url')

    if (!photoUrl) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: '缺少照片URL参数',
          usage: 'GET /api/test-photo-access?url=YOUR_PHOTO_URL'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    console.log('测试照片URL访问:', photoUrl)

    // 测试照片URL的可访问性
    const response = await fetch(photoUrl, {
      method: 'HEAD', // 只获取头部信息，不下载完整图片
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PhotoTest/1.0)'
      }
    })

    const result = {
      success: true,
      photoUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      accessible: response.ok,
      timestamp: new Date().toISOString()
    }

    console.log('照片访问测试结果:', result)

    return new NextResponse(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )

  } catch (error) {
    console.error('照片访问测试失败:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: '照片访问测试失败',
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