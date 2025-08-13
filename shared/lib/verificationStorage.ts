import fs from 'fs'
import path from 'path'

interface VerificationCode {
  code: string
  expires: number
  createdAt: number
}

interface VerificationData {
  emailCodes: Record<string, VerificationCode>
  smsCodes: Record<string, VerificationCode>
}

class VerificationStorage {
  private storageFile: string
  private data: VerificationData

  constructor() {
    this.storageFile = path.join(process.cwd(), 'verification-codes.json')
    this.data = this.loadData()
    this.cleanupExpiredCodes()
  }

  private loadData(): VerificationData {
    try {
      if (fs.existsSync(this.storageFile)) {
        const content = fs.readFileSync(this.storageFile, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.error('加载验证码存储文件失败:', error)
    }
    return { emailCodes: {}, smsCodes: {} }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('保存验证码存储文件失败:', error)
    }
  }

  private cleanupExpiredCodes(): void {
    const now = Date.now()
    let hasChanges = false

    // 清理过期的邮箱验证码
    Object.keys(this.data.emailCodes).forEach(email => {
      if (this.data.emailCodes[email].expires < now) {
        delete this.data.emailCodes[email]
        hasChanges = true
      }
    })

    // 清理过期的短信验证码
    Object.keys(this.data.smsCodes).forEach(phone => {
      if (this.data.smsCodes[phone].expires < now) {
        delete this.data.smsCodes[phone]
        hasChanges = true
      }
    })

    if (hasChanges) {
      this.saveData()
    }
  }

  // 邮箱验证码方法
  setEmailCode(email: string, code: string, expires: number): void {
    this.data.emailCodes[email] = {
      code,
      expires,
      createdAt: Date.now()
    }
    this.saveData()
  }

  getEmailCode(email: string): VerificationCode | null {
    this.cleanupExpiredCodes()
    return this.data.emailCodes[email] || null
  }

  deleteEmailCode(email: string): void {
    delete this.data.emailCodes[email]
    this.saveData()
  }

  // 短信验证码方法
  setSmsCode(phone: string, code: string, expires: number): void {
    this.data.smsCodes[phone] = {
      code,
      expires,
      createdAt: Date.now()
    }
    this.saveData()
  }

  getSmsCode(phone: string): VerificationCode | null {
    this.cleanupExpiredCodes()
    return this.data.smsCodes[phone] || null
  }

  deleteSmsCode(phone: string): void {
    delete this.data.smsCodes[phone]
    this.saveData()
  }

  // 获取所有验证码（用于调试）
  getAllCodes(): VerificationData {
    this.cleanupExpiredCodes()
    return this.data
  }

  // 清除所有验证码
  clearAllCodes(): void {
    this.data = { emailCodes: {}, smsCodes: {} }
    this.saveData()
  }
}

// 创建单例实例
const verificationStorage = new VerificationStorage()

export default verificationStorage 