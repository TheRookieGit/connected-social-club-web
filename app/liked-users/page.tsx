'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, Clock, User, AlertCircle, Eye, MessageCircle } from 'lucide-react'

interface LikedUser {
  id: number
  name: string
  age: number
  gender: string
  location: string
  bio: string
  occupation: string
  avatar_url: string
  isOnline: boolean
  lastSeen: string
  matchScore: number
  likedAt: string
  matchStatus: string
  canStartChat: boolean
  hasReceivedMessage: boolean
}

export default function LikedUsersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      alert('请先登录')
      router.push('/')
      return
    }

    const userData = JSON.parse(user)
    setCurrentUser(userData)
    
    loadLikedUsers(token)
  }, [router])

  const loadLikedUsers = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/liked-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLikedUsers(data.likedUsers)
        } else {
          setError(data.error || '加载失败')
        }
      } else {
        setError('网络错误')
      }
    } catch (error) {
      console.error('加载喜欢用户失败:', error)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen) return '未知'
    
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 5) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }

  const formatLikedAt = (likedAt: string) => {
    const likedDate = new Date(likedAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - likedDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }

  const getStatusBadge = (user: LikedUser) => {
    if (user.matchStatus === 'accepted') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          已匹配
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          等待回应
        </span>
      )
    }
  }

  const isFemale = currentUser?.gender === '女' || currentUser?.gender === 'female'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="text-blue-500" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">我的喜欢</h1>
                <p className="text-sm text-gray-500">
                  {likedUsers.length > 0 
                    ? `${likedUsers.length} 个你喜欢的用户`
                    : '你还没有喜欢过任何用户'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              返回主页
            </button>
          </div>
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className={`border rounded-lg p-4 mb-6 ${isFemale ? 'bg-pink-50 border-pink-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start space-x-3">
            <Eye className={`mt-0.5 ${isFemale ? 'text-pink-500' : 'text-blue-500'}`} size={20} />
            <div>
              <h3 className={`font-medium mb-1 ${isFemale ? 'text-pink-900' : 'text-blue-900'}`}>
                {isFemale ? '女性用户须知' : '男性用户须知'}
              </h3>
              <p className={`text-sm ${isFemale ? 'text-pink-700' : 'text-blue-700'}`}>
                {isFemale 
                  ? '在这里你可以看到所有你喜欢的用户。如果对方也喜欢了你，你们就会匹配成功。作为女性用户，你可以主动开始对话。'
                  : '在这里你可以看到所有你喜欢的用户。如果对方也喜欢了你，你们就会匹配成功。只有女性用户可以主动开始对话，你需要等待对方发消息给你。'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {likedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-blue-500" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              暂无喜欢记录
            </h2>
            <p className="text-gray-600 mb-6">
              你还没有喜欢过任何用户。<br/>
              去发现页面寻找心仪的对象吧！
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              去发现用户
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 用户头像 */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-blue-400" size={48} />
                    </div>
                  )}
                  {user.isOnline && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    {getStatusBadge(user)}
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <span className="text-sm text-gray-500">{user.age}岁</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                    <MapPin size={14} />
                    <span>{user.location}</span>
                  </div>
                  
                  {user.occupation && (
                    <p className="text-sm text-gray-600 mb-2">{user.occupation}</p>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {user.bio}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatLastSeen(user.lastSeen)}</span>
                    </div>
                    <span className={user.isOnline ? 'text-green-600' : 'text-gray-500'}>
                      {user.isOnline ? '在线' : '离线'}
                    </span>
                  </div>

                  {/* 喜欢时间 */}
                  <div className="text-xs text-gray-500 mb-4">
                    喜欢于 {formatLikedAt(user.likedAt)}
                  </div>

                  {/* 状态说明 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    {user.matchStatus === 'accepted' ? (
                      <div className="text-center">
                        <p className="text-sm text-green-700 font-medium mb-1">
                          🎉 匹配成功！
                        </p>
                        {isFemale ? (
                          <button
                            onClick={() => router.push(`/female-matches`)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            去开始对话
                          </button>
                        ) : (
                          <p className="text-xs text-gray-600">
                            等待对方开始对话
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-yellow-700 font-medium mb-1">
                          ⏳ 等待回应
                        </p>
                        <p className="text-xs text-gray-600">
                          对方还没有回应你的喜欢
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 