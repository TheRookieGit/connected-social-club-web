import { NextRequest, NextResponse } from 'next/server'
import { CurrencyService } from '@/lib/currencyService'

// 根据规则获取货币
export async function POST(request: NextRequest) {
  try {
    const { rule_name, user_id, reference_id, reference_type } = await request.json()

    if (!rule_name || !user_id) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    const result = await CurrencyService.earnByRule({
      rule_name,
      user_id,
      reference_id,
      reference_type
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('获取货币失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// 获取货币获取规则列表
export async function GET() {
  try {
    const rules = await CurrencyService.getCurrencyRules()
    
    return NextResponse.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('获取货币规则失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
} 