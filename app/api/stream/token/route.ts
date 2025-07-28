import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { StreamChat } from 'stream-chat'

// 验证JWT令牌
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const decoded = verifyToken(authHeader)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 创建Stream Chat客户端
    const serverClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    )

    // 生成用户令牌
    const userId = decoded.userId.toString()
    const streamToken = serverClient.createToken(userId)

    console.log(`为用户 ${userId} 生成Stream Chat令牌`)

    return NextResponse.json({
      success: true,
      token: streamToken,
      userId: userId
    })

  } catch (error) {
    console.error('生成Stream Chat令牌错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
} 