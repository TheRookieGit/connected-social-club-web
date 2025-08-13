'use client'

import { useState, useEffect } from 'react'
import { Heart, Wallet, ShoppingCart, Gift, TrendingUp } from 'lucide-react'
import WalletDisplay from '@/components/WalletDisplay'
import CurrencyShop from '@/components/CurrencyShop'

export default function CurrencyPage() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'shop' | 'gifts' | 'earnings'>('wallet')
  const [userId, setUserId] = useState<number | null>(null)
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从localStorage获取用户ID
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // 解析JWT token获取用户ID
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserId(payload.userId || payload.sub)
      } catch (error) {
        console.error('解析token失败:', error)
        // 如果解析失败，尝试从localStorage获取用户ID
        const userId = localStorage.getItem('userId')
        if (userId) {
          setUserId(parseInt(userId))
        }
      }
    }
    setLoading(false)
  }, [])

  const handlePurchase = (productId: number) => {
    // 更新用户余额（这里应该从钱包组件获取最新余额）
    console.log('购买商品:', productId)
  }

  const tabs = [
    { id: 'wallet', name: '我的钱包', icon: Wallet },
    { id: 'shop', name: '心动商店', icon: ShoppingCart },
    { id: 'gifts', name: '礼物中心', icon: Gift },
            { id: 'earnings', name: '赚取桃花币', icon: TrendingUp }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">桃花币系统</h1>
          </div>
          <p className="text-gray-600 mt-2">
            通过桃花币解锁更多功能，提升你的交友体验
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 标签页导航 */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 mb-8 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* 内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：钱包信息 */}
          <div className="lg:col-span-1">
            {userId && (
              <WalletDisplay 
                userId={userId} 
                className="sticky top-8"
              />
            )}
          </div>

          {/* 右侧：主要内容 */}
          <div className="lg:col-span-2">
            {activeTab === 'wallet' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">钱包详情</h2>
                <p className="text-gray-600">
                  在左侧查看你的钱包余额和交易记录。桃花币可以通过各种活动获得，用于购买平台功能和服务。
                </p>
              </div>
            )}

            {activeTab === 'shop' && userId && (
              <CurrencyShop
                userId={userId}
                userBalance={userBalance}
                onPurchase={handlePurchase}
              />
            )}

            {activeTab === 'gifts' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <Gift className="h-6 w-6 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900">礼物中心</h2>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">礼物功能即将上线</p>
                  <p className="text-sm">在这里你可以购买和发送精美的礼物给心仪的对象</p>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900">赚取桃花币</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 每日任务 */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">每日任务</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">每日登录</p>
                            <p className="text-sm text-gray-600">每日首次登录</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">+10</p>
                          <p className="text-xs text-gray-500">桃花币</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">发送消息</p>
                            <p className="text-sm text-gray-600">每日发送消息</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">+5</p>
                          <p className="text-xs text-gray-500">桃花币</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 一次性奖励 */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">一次性奖励</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">完善资料</p>
                            <p className="text-sm text-gray-600">完善个人资料</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600">+50</p>
                          <p className="text-xs text-gray-500">桃花币</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                            <Heart className="h-4 w-4 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">上传照片</p>
                            <p className="text-sm text-gray-600">上传个人照片</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-pink-600">+30</p>
                          <p className="text-xs text-gray-500">桃花币</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 成就系统 */}
                <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">成就系统</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="font-medium text-gray-900">连续登录</p>
                      <p className="text-sm text-gray-600">连续登录7天</p>
                      <p className="text-lg font-semibold text-yellow-600 mt-2">+50</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="font-medium text-gray-900">活跃用户</p>
                      <p className="text-sm text-gray-600">成为活跃用户</p>
                      <p className="text-lg font-semibold text-orange-600 mt-2">+200</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="font-medium text-gray-900">推荐好友</p>
                      <p className="text-sm text-gray-600">成功推荐好友</p>
                      <p className="text-lg font-semibold text-red-600 mt-2">+100</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 