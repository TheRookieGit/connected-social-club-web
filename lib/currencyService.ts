import { createClient } from '@supabase/supabase-js'
import { 
  UserWallet, 
  CurrencyTransaction, 
  CurrencyRule, 
  CurrencyProduct,
  Gift,
  CurrencyResponse,
  WalletBalanceResponse,
  PurchaseRequest,
  GiftSendRequest,
  CurrencyEarnRequest
} from '@/types/currency'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class CurrencyService {
  // 获取用户钱包
  static async getUserWallet(userId: number): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('获取用户钱包失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户钱包异常:', error)
      return null
    }
  }

  // 创建用户钱包
  static async createUserWallet(userId: number): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        })
        .select()
        .single()

      if (error) {
        console.error('创建用户钱包失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('创建用户钱包异常:', error)
      return null
    }
  }

  // 获取或创建用户钱包
  static async getOrCreateWallet(userId: number): Promise<UserWallet | null> {
    let wallet = await this.getUserWallet(userId)
    if (!wallet) {
      wallet = await this.createUserWallet(userId)
    }
    return wallet
  }

  // 添加货币到用户钱包
  static async addCurrency(
    userId: number, 
    amount: number, 
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<CurrencyResponse> {
    try {
      // 获取用户钱包
      const wallet = await this.getOrCreateWallet(userId)
      if (!wallet) {
        return { success: false, message: '钱包不存在' }
      }

      const balanceBefore = wallet.balance
      const balanceAfter = balanceBefore + amount

      // 开始事务
      const { data: transaction, error: transactionError } = await supabase
        .from('currency_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'earn',
          amount: amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: description,
          reference_id: referenceId,
          reference_type: referenceType,
          status: 'completed'
        })
        .select()
        .single()

      if (transactionError) {
        console.error('创建交易记录失败:', transactionError)
        return { success: false, message: '创建交易记录失败' }
      }

      // 更新钱包余额
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          balance: balanceAfter,
          total_earned: wallet.total_earned + amount
        })
        .eq('user_id', userId)

      if (walletError) {
        console.error('更新钱包失败:', walletError)
        return { success: false, message: '更新钱包失败' }
      }

      return { 
        success: true, 
        message: `成功获得 ${amount} 个桃花币`,
        data: { transaction, newBalance: balanceAfter }
      }
    } catch (error) {
      console.error('添加货币异常:', error)
      return { success: false, message: '系统错误' }
    }
  }

  // 从用户钱包扣除货币
  static async deductCurrency(
    userId: number, 
    amount: number, 
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<CurrencyResponse> {
    try {
      // 获取用户钱包
      const wallet = await this.getUserWallet(userId)
      if (!wallet) {
        return { success: false, message: '钱包不存在' }
      }

      if (wallet.balance < amount) {
        return { success: false, message: '余额不足' }
      }

      const balanceBefore = wallet.balance
      const balanceAfter = balanceBefore - amount

      // 开始事务
      const { data: transaction, error: transactionError } = await supabase
        .from('currency_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'spend',
          amount: -amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: description,
          reference_id: referenceId,
          reference_type: referenceType,
          status: 'completed'
        })
        .select()
        .single()

      if (transactionError) {
        console.error('创建交易记录失败:', transactionError)
        return { success: false, message: '创建交易记录失败' }
      }

      // 更新钱包余额
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          balance: balanceAfter,
          total_spent: wallet.total_spent + amount
        })
        .eq('user_id', userId)

      if (walletError) {
        console.error('更新钱包失败:', walletError)
        return { success: false, message: '更新钱包失败' }
      }

      return { 
        success: true, 
        message: `成功消费 ${amount} 个桃花币`,
        data: { transaction, newBalance: balanceAfter }
      }
    } catch (error) {
      console.error('扣除货币异常:', error)
      return { success: false, message: '系统错误' }
    }
  }

  // 根据规则获取货币
  static async earnByRule(request: CurrencyEarnRequest): Promise<CurrencyResponse> {
    try {
      // 获取规则
      const { data: rule, error: ruleError } = await supabase
        .from('currency_rules')
        .select('*')
        .eq('rule_name', request.rule_name)
        .eq('is_active', true)
        .single()

      if (ruleError || !rule) {
        return { success: false, message: '规则不存在或已禁用' }
      }

      // 检查每日限制
      if (rule.rule_type === 'daily') {
        const today = new Date().toISOString().split('T')[0]
        const { data: todayEarnings, error: earningsError } = await supabase
          .from('user_currency_earnings')
          .select('*')
          .eq('user_id', request.user_id)
          .eq('rule_id', rule.id)
          .eq('earned_date', today)

        if (earningsError) {
          console.error('检查每日获取记录失败:', earningsError)
          return { success: false, message: '检查获取记录失败' }
        }

        if (todayEarnings && todayEarnings.length >= rule.max_daily_limit) {
          return { success: false, message: '今日已达到获取上限' }
        }
      }

      // 检查总限制
      if (rule.max_total_limit) {
        const { data: totalEarnings, error: totalError } = await supabase
          .from('user_currency_earnings')
          .select('*')
          .eq('user_id', request.user_id)
          .eq('rule_id', rule.id)

        if (totalError) {
          console.error('检查总获取记录失败:', totalError)
          return { success: false, message: '检查获取记录失败' }
        }

        if (totalEarnings && totalEarnings.length >= rule.max_total_limit) {
          return { success: false, message: '已达到总获取上限' }
        }
      }

      // 添加货币
      const result = await this.addCurrency(
        request.user_id,
        rule.amount,
        rule.description || `通过${rule.rule_name}获得`,
        request.reference_id,
        request.reference_type
      )

      if (result.success) {
        // 记录获取历史
        const today = new Date().toISOString().split('T')[0]
        await supabase
          .from('user_currency_earnings')
          .insert({
            user_id: request.user_id,
            rule_id: rule.id,
            amount: rule.amount,
            earned_date: today
          })
      }

      return result
    } catch (error) {
      console.error('根据规则获取货币异常:', error)
      return { success: false, message: '系统错误' }
    }
  }

  // 购买商品
  static async purchaseProduct(request: PurchaseRequest): Promise<CurrencyResponse> {
    try {
      // 获取商品信息
      const { data: product, error: productError } = await supabase
        .from('currency_products')
        .select('*')
        .eq('id', request.product_id)
        .eq('is_active', true)
        .single()

      if (productError || !product) {
        return { success: false, message: '商品不存在或已下架' }
      }

      // 扣除货币
      const result = await this.deductCurrency(
        request.user_id,
        product.price,
        `购买${product.product_name}`,
        request.product_id.toString(),
        'product'
      )

      if (result.success) {
        // 记录购买历史
        const expiresAt = product.product_type === 'boost' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
          : null

        await supabase
          .from('user_purchases')
          .insert({
            user_id: request.user_id,
            product_id: request.product_id,
            amount: product.price,
            status: 'completed',
            expires_at: expiresAt
          })
      }

      return result
    } catch (error) {
      console.error('购买商品异常:', error)
      return { success: false, message: '系统错误' }
    }
  }

  // 发送礼物
  static async sendGift(request: GiftSendRequest): Promise<CurrencyResponse> {
    try {
      // 获取礼物信息
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', request.gift_id)
        .eq('is_active', true)
        .single()

      if (giftError || !gift) {
        return { success: false, message: '礼物不存在或已下架' }
      }

      // 扣除发送者货币
      const result = await this.deductCurrency(
        request.sender_id,
        gift.price,
        `发送礼物${gift.gift_name}给用户`,
        request.gift_id.toString(),
        'gift'
      )

      if (result.success) {
        // 记录礼物交易
        await supabase
          .from('gift_transactions')
          .insert({
            sender_id: request.sender_id,
            receiver_id: request.receiver_id,
            gift_id: request.gift_id,
            amount: gift.price,
            message: request.message,
            conversation_id: request.conversation_id
          })
      }

      return result
    } catch (error) {
      console.error('发送礼物异常:', error)
      return { success: false, message: '系统错误' }
    }
  }

  // 获取钱包余额和交易记录
  static async getWalletBalance(userId: number): Promise<WalletBalanceResponse | null> {
    try {
      // 获取或创建用户钱包
      const wallet = await this.getOrCreateWallet(userId)
      if (!wallet) {
        return null
      }

      // 获取最近交易记录
      const { data: transactions, error: transactionError } = await supabase
        .from('currency_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionError) {
        console.error('获取交易记录失败:', transactionError)
      }

      return {
        balance: wallet.balance,
        total_earned: wallet.total_earned,
        total_spent: wallet.total_spent,
        recent_transactions: transactions || []
      }
    } catch (error) {
      console.error('获取钱包余额异常:', error)
      return null
    }
  }

  // 获取可用商品列表
  static async getAvailableProducts(): Promise<CurrencyProduct[]> {
    try {
      const { data, error } = await supabase
        .from('currency_products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        console.error('获取商品列表失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取商品列表异常:', error)
      return []
    }
  }

  // 获取可用礼物列表
  static async getAvailableGifts(): Promise<Gift[]> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        console.error('获取礼物列表失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取礼物列表异常:', error)
      return []
    }
  }

  // 获取货币获取规则
  static async getCurrencyRules(): Promise<CurrencyRule[]> {
    try {
      const { data, error } = await supabase
        .from('currency_rules')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: false })

      if (error) {
        console.error('获取货币规则失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取货币规则异常:', error)
      return []
    }
  }
} 