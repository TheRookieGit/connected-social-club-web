import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  UserWallet, 
  CurrencyTransaction, 
  CurrencyRule, 
  CurrencyProduct, 
  Gift, 
  CurrencyResponse 
} from '../types/currency'

const API_BASE_URL = 'https://your-api-domain.com/api' // 请替换为您的实际API域名

export class CurrencyService {
  // 获取用户钱包
  static async getUserWallet(): Promise<UserWallet | null> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return null

      const response = await fetch(`${API_BASE_URL}/currency/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.wallet
      }
      return null
    } catch (error) {
      console.error('获取钱包失败:', error)
      return null
    }
  }

  // 获取交易记录
  static async getTransactionHistory(limit = 20, offset = 0): Promise<CurrencyTransaction[]> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return []

      const response = await fetch(`${API_BASE_URL}/currency/transactions?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.transactions || []
      }
      return []
    } catch (error) {
      console.error('获取交易记录失败:', error)
      return []
    }
  }

  // 获取货币规则
  static async getCurrencyRules(): Promise<CurrencyRule[]> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return []

      const response = await fetch(`${API_BASE_URL}/currency/rules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.rules || []
      }
      return []
    } catch (error) {
      console.error('获取货币规则失败:', error)
      return []
    }
  }

  // 获取商品列表
  static async getProducts(): Promise<CurrencyProduct[]> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return []

      const response = await fetch(`${API_BASE_URL}/currency/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.products || []
      }
      return []
    } catch (error) {
      console.error('获取商品列表失败:', error)
      return []
    }
  }

  // 获取礼物列表
  static async getGifts(): Promise<Gift[]> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return []

      const response = await fetch(`${API_BASE_URL}/currency/gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.gifts || []
      }
      return []
    } catch (error) {
      console.error('获取礼物列表失败:', error)
      return []
    }
  }

  // 购买商品
  static async purchaseProduct(productId: number): Promise<CurrencyResponse> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, message: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/currency/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('购买商品失败:', error)
      return { success: false, message: '网络错误' }
    }
  }

  // 发送礼物
  static async sendGift(giftId: number, recipientId: number): Promise<CurrencyResponse> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, message: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/currency/gift`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          gift_id: giftId, 
          recipient_id: recipientId 
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('发送礼物失败:', error)
      return { success: false, message: '网络错误' }
    }
  }

  // 每日签到
  static async dailyCheckIn(): Promise<CurrencyResponse> {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, message: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/currency/earn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          rule_code: 'daily_checkin',
          description: '每日签到奖励'
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('每日签到失败:', error)
      return { success: false, message: '网络错误' }
    }
  }
} 