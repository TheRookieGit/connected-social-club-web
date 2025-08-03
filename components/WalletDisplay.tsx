'use client'

import { useState, useEffect } from 'react'
import { Heart, TrendingUp, TrendingDown, History } from 'lucide-react'
import { WalletBalanceResponse, CurrencyTransaction } from '@/types/currency'

interface WalletDisplayProps {
  userId: number
  className?: string
}

export default function WalletDisplay({ userId, className = '' }: WalletDisplayProps) {
  const [walletData, setWalletData] = useState<WalletBalanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWalletData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/currency/wallet?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setWalletData(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('获取钱包数据失败:', error)
      setError('获取钱包数据失败')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toFixed(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (transaction: CurrencyTransaction) => {
    if (transaction.transaction_type === 'earn') {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (transaction.transaction_type === 'spend') {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else if (transaction.transaction_type === 'gift') {
      return <Heart className="h-4 w-4 text-pink-500" />
    }
    return <History className="h-4 w-4 text-gray-500" />
  }

  const getTransactionColor = (transaction: CurrencyTransaction) => {
    if (transaction.transaction_type === 'earn') {
      return 'text-green-600'
    } else if (transaction.transaction_type === 'spend') {
      return 'text-red-600'
    } else if (transaction.transaction_type === 'gift') {
      return 'text-pink-600'
    }
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="text-center text-gray-500">
          <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>{error}</p>
          <button
            onClick={fetchWalletData}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!walletData) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
        <div className="text-center text-gray-500">
          <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>钱包数据不可用</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${className}`}>
      {/* 钱包标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">桃花币钱包</h3>
        </div>
        <button
          onClick={fetchWalletData}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          刷新
        </button>
      </div>

      {/* 余额显示 */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">当前余额</p>
          <div className="flex items-center justify-center space-x-1">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-3xl font-bold text-gray-900">
              {formatAmount(walletData.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">总收入</span>
          </div>
          <p className="text-lg font-semibold text-green-600">
            {formatAmount(walletData.total_earned)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">总支出</span>
          </div>
          <p className="text-lg font-semibold text-red-600">
            {formatAmount(walletData.total_spent)}
          </p>
        </div>
      </div>

      {/* 最近交易记录 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">最近交易</h4>
        <div className="space-y-3">
          {walletData.recent_transactions.length > 0 ? (
            walletData.recent_transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getTransactionColor(transaction)}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    余额: {formatAmount(transaction.balance_after)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">暂无交易记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 