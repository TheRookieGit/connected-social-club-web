'use client'

import { useState, useEffect } from 'react'
import { X, Heart, UserX, Clock, MapPin, Star, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PendingUser {
  id: string
  name: string
  age: number
  location: string
  bio: string
  matchScore: number
  isOnline: boolean
  avatar_url?: string
  matchedAt: string
}

interface PendingMatchesPanelProps {
  onClose: () => void
  onMatchAccepted: () => void // 回调函数，用于刷新已匹配用户列表
}

export default function PendingMatchesPanel({ onClose, onMatchAccepted }: PendingMatchesPanelProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 获取待接受的匹配
  const fetchPendingMatches = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('fetchPendingMatches: 没有token，跳过')
        return
      }

      console.log('fetchPendingMatches: 开始获取待接受匹配...')
      const response = await fetch('/api/user/pending-matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('fetchPendingMatches: API响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('fetchPendingMatches: API返回数据:', data)
        
        if (data.success) {
          if (data.pendingMatches && data.pendingMatches.length > 0) {
            const formattedUsers: PendingUser[] = data.pendingMatches.map((user: any) => ({
              id: user.id.toString(),
              name: user.name,
              age: user.age,
              location: user.location,
              bio: user.bio,
              matchScore: user.matchScore,
              isOnline: user.isOnline,
              avatar_url: user.avatar_url,
              matchedAt: user.matchedAt
            }))
            setPendingUsers(formattedUsers)
            console.log('✅ 成功获取到待接受匹配:', formattedUsers)
          } else {
            console.log('📭 没有找到待接受的匹配')
            setPendingUsers([])
          }
        } else {
          console.error('❌ API返回失败:', data.error)
        }
      } else {
        console.error('❌ API请求失败，状态码:', response.status)
        const errorText = await response.text()
        console.error('❌ 错误详情:', errorText)
      }
    } catch (error) {
      console.error('❌ 获取待接受匹配失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingMatches()
  }, [])

  // 处理匹配请求（接受或拒绝）
  const handleMatchAction = async (senderUserId: string, action: 'accept' | 'reject') => {
    setActionLoading(senderUserId)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }

      const response = await fetch('/api/user/pending-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderUserId: parseInt(senderUserId),
          action
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 从列表中移除已处理的用户
          setPendingUsers(prev => prev.filter(user => user.id !== senderUserId))
          
          if (action === 'accept') {
            // 通知父组件刷新已匹配用户列表
            onMatchAccepted()
            
            // 显示成功消息
            const user = pendingUsers.find(u => u.id === senderUserId)
            if (user) {
              alert(`🎉 恭喜！你和${user.name}匹配成功了！`)
            }
          }
          
          console.log(`✅ ${action === 'accept' ? '接受' : '拒绝'}匹配成功:`, data.message)
        } else {
          console.error('❌ 处理匹配失败:', data.error)
          alert('处理失败: ' + data.error)
        }
      } else {
        console.error('❌ 处理匹配请求失败')
        alert('处理失败，请重试')
      }
    } catch (error) {
      console.error('❌ 处理匹配错误:', error)
      alert('网络错误，请重试')
    } finally {
      setActionLoading(null)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return '刚刚'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
    return `${Math.floor(diffInSeconds / 86400)}天前`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="text-purple-500" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">待接受匹配</h3>
              <p className="text-sm text-gray-500">
                {loading 
                  ? '加载中...'
                  : pendingUsers.length > 0 
                    ? `${pendingUsers.length} 个用户想要和你匹配`
                    : '暂时没有新的匹配请求'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-500">加载待接受匹配中...</p>
              </div>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                暂无待处理匹配
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                当有用户喜欢你时，<br/>
                他们的匹配请求会出现在这里
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                返回浏览用户
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {pendingUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {/* 用户信息头部 */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar_url && user.avatar_url !== '/api/placeholder/400/600' ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) {
                                  fallback.style.display = 'flex'
                                }
                              }}
                            />
                          ) : null}
                          <span 
                            className="text-purple-600 font-bold text-xl"
                            style={{ display: (user.avatar_url && user.avatar_url !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                          >
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">{user.name}</h4>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{user.age}岁</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                          <MapPin size={12} />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock size={10} />
                          <span>{formatTimeAgo(user.matchedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 匹配分数 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">匹配度</span>
                        <span className="text-sm font-bold text-purple-600">{user.matchScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${user.matchScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 个人简介 */}
                    <div className="mb-6">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {user.bio}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() => handleMatchAction(user.id, 'reject')}
                        disabled={actionLoading === user.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            <XCircle size={16} />
                            <span className="font-medium">拒绝</span>
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleMatchAction(user.id, 'accept')}
                        disabled={actionLoading === user.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            <Heart size={16} />
                            <span className="font-medium">接受</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {!loading && pendingUsers.length > 0 && (
          <div className="p-4 bg-gray-50 border-t">
            <p className="text-center text-sm text-gray-500">
              💡 提示：接受匹配后，你们就可以开始聊天了！
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
} 