import { NextRequest, NextResponse } from 'next/server'
import { CurrencyService } from '@/lib/currencyService'

// 发送礼物
export async function POST(request: NextRequest) {
  try {
    const { sender_id, receiver_id, gift_id, message, conversation_id } = await request.json()

    if (!sender_id || !receiver_id || !gift_id) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    const result = await CurrencyService.sendGift({
      sender_id,
      receiver_id,
      gift_id,
      message,
      conversation_id
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('发送礼物失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取可用礼物列表
export async function GET() {
  try {
    const gifts = await CurrencyService.getAvailableGifts()
    
    return NextResponse.json({
      success: true,
      data: gifts
    })
  } catch (error) {
    console.error('获取礼物列表失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
} 