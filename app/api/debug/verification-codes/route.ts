import { NextRequest, NextResponse } from 'next/server'
import verificationStorage from '@/lib/verificationStorage'

export async function GET(request: NextRequest) {
  try {
    const allCodes = verificationStorage.getAllCodes()
    
    const emailCodesArray = Object.entries(allCodes.emailCodes).map(([email, data]) => ({
      email,
      code: data.code,
      expires: data.expires,
      createdAt: data.createdAt
    }))

    const smsCodesArray = Object.entries(allCodes.smsCodes).map(([phone, data]) => ({
      phone,
      code: data.code,
      expires: data.expires,
      createdAt: data.createdAt
    }))

    return NextResponse.json({
      emailCodes: emailCodesArray,
      smsCodes: smsCodesArray,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('获取验证码状态失败:', error)
    return NextResponse.json(
      { error: '获取验证码状态失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'clear') {
      verificationStorage.clearAllCodes()
      return NextResponse.json({ success: true, message: '所有验证码已清除' })
    }
    
    return NextResponse.json({ error: '无效的操作' }, { status: 400 })
  } catch (error) {
    console.error('清除验证码失败:', error)
    return NextResponse.json(
      { error: '清除验证码失败' },
      { status: 500 }
    )
  }
} 