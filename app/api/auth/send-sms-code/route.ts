import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// 存储验证码的临时对象（生产环境应使用Redis）
const smsCodes = new Map<string, { code: string; expires: number }>()

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送短信
async function sendSMS(phone: string, code: string): Promise<boolean> {
  try {
    console.log('🔍 检查环境变量...')
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID)
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '已设置' : '未设置')
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER)
    
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      console.log(`📱 正在通过Twilio发送短信到 ${phone}`)
      
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
      
      await client.messages.create({
        body: `您的ConnectEd Elite Social Club验证码是：${code}，有效期10分钟。`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      })
      
      console.log(`✅ Twilio短信已成功发送到 ${phone}`)
      return true
    } else {
      // 未配置Twilio时，模拟发送
      console.log(`模拟发送短信到 ${phone}，验证码：${code}`)
      console.log('💡 提示: 要发送真实短信，请在 .env.local 配置 Twilio 相关信息')
      return true
    }
  } catch (error: any) {
    console.error('发送短信失败:', error)
    if (error.code) {
      console.error('Twilio错误代码:', error.code)
    }
    if (error.message) {
      console.error('错误消息:', error.message)
    }
    if (error.moreInfo) {
      console.error('更多信息:', error.moreInfo)
    }
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode } = await request.json()

    if (!phone || !countryCode) {
      return NextResponse.json(
        { error: '手机号和国家代码都是必需的' },
        { status: 400 }
      )
    }

    // 验证手机号格式（支持国际格式）
    const phoneRegex = /^\d{5,15}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      )
    }

    // 检查是否频繁发送
    const fullPhone = `${countryCode}${phone}`
    const existingData = smsCodes.get(fullPhone)
    if (existingData && Date.now() < existingData.expires + 60000) {
      return NextResponse.json(
        { error: '请等待1分钟后再发送验证码' },
        { status: 429 }
      )
    }

    // 生成验证码
    const code = generateCode()
    const expires = Date.now() + 10 * 60 * 1000 // 10分钟过期

    // 存储验证码
    smsCodes.set(fullPhone, { code, expires })

    // 发送短信
    const sendResult = await sendSMS(fullPhone, code)

    if (!sendResult) {
      smsCodes.delete(fullPhone)
      return NextResponse.json(
        { error: '发送验证码失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的手机'
    })

  } catch (error) {
    console.error('发送短信验证码失败:', error)
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { phone, countryCode, code } = await request.json()

    if (!phone || !countryCode || !code) {
      return NextResponse.json(
        { error: '手机号、国家代码和验证码都是必需的' },
        { status: 400 }
      )
    }

    const fullPhone = `${countryCode}${phone}`
    const storedData = smsCodes.get(fullPhone)
    
    if (!storedData) {
      return NextResponse.json(
        { error: '验证码不存在或已过期' },
        { status: 400 }
      )
    }

    if (Date.now() > storedData.expires) {
      smsCodes.delete(fullPhone)
      return NextResponse.json(
        { error: '验证码已过期' },
        { status: 400 }
      )
    }

    if (storedData.code !== code) {
      return NextResponse.json(
        { error: '验证码不正确' },
        { status: 400 }
      )
    }

    // 验证成功，删除验证码
    smsCodes.delete(fullPhone)

    return NextResponse.json({
      success: true,
      message: '手机验证成功'
    })

  } catch (error) {
    console.error('验证手机验证码失败:', error)
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
} 