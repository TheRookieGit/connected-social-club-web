import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import verificationStorage from '@/lib/verificationStorage'

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送邮件
async function sendEmail(email: string, code: string): Promise<boolean> {
  try {
    // 检查是否配置了邮件服务
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`📧 正在发送真实邮件到 ${email}`)
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'ConnectEd Elite Social Club - 邮箱验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 20px; text-align: center;">
                              <h1 style="color: white; margin: 0;">ConnectEd Elite Social Club</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">邮箱验证码</h2>
              <p style="color: #666; line-height: 1.6;">
                您好！感谢您注册ConnectEd Elite Social Club。请使用以下验证码完成邮箱验证：
              </p>
              <div style="background: #fff; border: 2px dashed #ff6b6b; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 5px;">${code}</span>
              </div>
              <p style="color: #666; font-size: 14px;">
                ⚠️ 验证码有效期为10分钟，请尽快使用
              </p>
              <p style="color: #666; font-size: 14px;">
                🔒 如果这不是您的操作，请忽略此邮件
              </p>
            </div>
            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #fff; margin: 0; font-size: 14px;">
                © 2024 ConnectEd Elite Social Club. 保留所有权利.
              </p>
            </div>
          </div>
        `
      }

      await transporter.sendMail(mailOptions)
      console.log(`✅ 真实邮件已成功发送到 ${email}`)
      return true
    } else {
      // 如果没有配置邮件服务，使用模拟发送
      console.log(`📧 模拟发送邮件到 ${email}`)
      console.log(`📧 邮件主题: ConnectEd Elite Social Club - 邮箱验证码`)
      console.log(`📧 验证码: ${code}`)
              console.log(`📧 邮件内容: 您好！感谢您注册ConnectEd Elite Social Club。请使用验证码 ${code} 完成邮箱验证，有效期10分钟。`)
      console.log(`💡 提示: 要发送真实邮件，请在 .env.local 文件中配置 EMAIL_USER 和 EMAIL_PASS`)
      return true
    }
  } catch (error) {
    console.error('发送邮件失败:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址是必需的' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 生成验证码
    const code = generateCode()
    const expires = Date.now() + 10 * 60 * 1000 // 10分钟过期

    // 存储验证码
    verificationStorage.setEmailCode(email, code, expires)

    // 发送邮件
    const sendResult = await sendEmail(email, code)

    if (!sendResult) {
      verificationStorage.deleteEmailCode(email)
      return NextResponse.json(
        { error: '发送验证码失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱'
    })

  } catch (error) {
    console.error('发送邮件验证码失败:', error)
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 验证邮箱验证码
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: '邮箱和验证码都是必需的' },
        { status: 400 }
      )
    }

    const storedData = verificationStorage.getEmailCode(email)
    
    if (!storedData) {
      return NextResponse.json(
        { error: '验证码不存在或已过期' },
        { status: 400 }
      )
    }

    if (Date.now() > storedData.expires) {
      verificationStorage.deleteEmailCode(email)
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
    verificationStorage.deleteEmailCode(email)

    return NextResponse.json({
      success: true,
      message: '邮箱验证成功'
    })

  } catch (error) {
    console.error('验证邮箱验证码失败:', error)
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
} 