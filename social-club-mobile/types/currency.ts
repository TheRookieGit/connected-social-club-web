export interface UserWallet {
  id: number
  user_id: number
  balance: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface CurrencyTransaction {
  id: number
  user_id: number
  transaction_type: 'earn' | 'spend' | 'gift' | 'refund'
  amount: number
  balance_before: number
  balance_after: number
  description: string
  reference_id?: string
  reference_type?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
}

export interface CurrencyRule {
  id: number
  rule_name: string
  rule_type: 'daily' | 'one_time' | 'achievement' | 'referral'
  amount: number
  max_daily_limit: number
  max_total_limit?: number
  description: string
  is_active: boolean
}

export interface CurrencyProduct {
  id: number
  name: string
  description: string
  price: number
  category: string
  is_active: boolean
}

export interface Gift {
  id: number
  name: string
  description: string
  price: number
  icon: string
  animation_url?: string
  is_active: boolean
}

export interface CurrencyResponse {
  success: boolean
  message: string
  data?: any
} 