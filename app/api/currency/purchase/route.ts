import { NextRequest, NextResponse } from 'next/server'
import { CurrencyService } from '@/lib/currencyService'

// 购买商品
export async function POST(request: NextRequest) {
  try {
    const { product_id, user_id } = await request.json()

    if (!product_id || !user_id) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    const result = await CurrencyService.purchaseProduct({
      product_id,
      user_id
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('购买商品失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取可用商品列表
export async function GET() {
  try {
    const products = await CurrencyService.getAvailableProducts()
    
    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
} 