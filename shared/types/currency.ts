// 货币系统类型定义

// 用户钱包
export interface UserWallet {
  id: number
  user_id: number
  balance: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

// 交易记录
export interface CurrencyTransaction {
  id: number
  user_id: number
  transaction_type: 'earn' | 'spend' | 'gift' | 'refund'
  amount: number
  balance_before: number
  balance_after: number
  description?: string
  reference_id?: string
  reference_type?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
}

// 货币获取规则
export interface CurrencyRule {
  id: number
  rule_name: string
  rule_type: 'daily' | 'one_time' | 'achievement' | 'referral'
  amount: number
  max_daily_limit: number
  max_total_limit?: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 用户货币获取记录
export interface UserCurrencyEarning {
  id: number
  user_id: number
  rule_id: number
  amount: number
  earned_date: string
  created_at: string
}

// 货币消费项目
export interface CurrencyProduct {
  id: number
  product_name: string
  product_type: 'feature' | 'boost' | 'gift' | 'premium'
  price: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 用户购买记录
export interface UserPurchase {
  id: number
  user_id: number
  product_id: number
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  purchase_date: string
  expires_at?: string
  created_at: string
}

// 礼物
export interface Gift {
  id: number
  gift_name: string
  gift_type: 'emoji' | 'sticker' | 'animation' | 'special'
  price: number
  icon_url?: string
  animation_url?: string
  is_active: boolean
  created_at: string
}

// 礼物交易
export interface GiftTransaction {
  id: number
  sender_id: number
  receiver_id: number
  gift_id: number
  amount: number
  message?: string
  conversation_id?: number
  created_at: string
}

// 货币系统响应
export interface CurrencyResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

// 钱包余额响应
export interface WalletBalanceResponse {
  balance: number
  total_earned: number
  total_spent: number
  recent_transactions: CurrencyTransaction[]
}

// 购买请求
export interface PurchaseRequest {
  product_id: number
  user_id: number
}

// 礼物发送请求
export interface GiftSendRequest {
  sender_id: number
  receiver_id: number
  gift_id: number
  message?: string
  conversation_id?: number
}

// 货币获取请求
export interface CurrencyEarnRequest {
  rule_name: string
  user_id: number
  reference_id?: string
  reference_type?: string
}

// 货币系统统计
export interface CurrencyStats {
  total_users: number
  total_balance: number
  total_transactions: number
  daily_earnings: number
  daily_spending: number
  popular_products: Array<{
    product_name: string
    purchase_count: number
  }>
  popular_gifts: Array<{
    gift_name: string
    send_count: number
  }>
} 