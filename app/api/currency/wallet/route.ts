import { NextRequest, NextResponse } from 'next/server'
import { CurrencyService } from '@/lib/currencyService'

// 获取用户钱包余额
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少用户ID' },
        { status: 400 }
      )
    }

    const walletData = await CurrencyService.getWalletBalance(parseInt(userId))
    
    if (!walletData) {
      return NextResponse.json(
        { success: false, message: '钱包不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: walletData
    })
  } catch (error) {
    console.error('获取钱包余额失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建用户钱包
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少用户ID' },
        { status: 400 }
      )
    }

    const wallet = await CurrencyService.createUserWallet(userId)
    
    if (!wallet) {
      return NextResponse.json(
        { success: false, message: '创建钱包失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '钱包创建成功',
      data: wallet
    })
  } catch (error) {
    console.error('创建钱包失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
} 