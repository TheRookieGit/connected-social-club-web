'use client'

import { useState, useEffect } from 'react'
import { Users, User, Image as ImageIcon } from 'lucide-react'

interface MatchedUser {
  id: string
  name: string
  age: number
  location: string
  bio: string
  photos: string[]
  avatar_url?: string
  isOnline: boolean
}

export default function TestUserAvatars() {
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMatchedUsers()
  }, [])

  const fetchMatchedUsers = async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      console.log('开始获取已匹配用户...')
      const response = await fetch('/api/user/matched-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('API响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API返回数据:', data)
        
        if (data.success) {
          if (data.matchedUsers && data.matchedUsers.length > 0) {
            setMatchedUsers(data.matchedUsers)
            console.log('✅ 成功获取到已匹配用户:', data.matchedUsers)
          } else {
            console.log('📭 没有找到已匹配的用户')
            setMatchedUsers([])
          }
        } else {
          setError(data.error || '获取用户失败')
        }
      } else {
        setError('API请求失败')
      }
    } catch (error) {
      console.error('获取已匹配用户失败:', error)
      setError('获取用户失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getAvatarUrl = (user: MatchedUser) => {
    // 优先使用用户上传的照片
    if (user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600') {
      return user.photos[0]
    }
    // 其次使用头像URL
    if (user.avatar_url && user.avatar_url !== '/api/placeholder/400/600') {
      return user.avatar_url
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 用户头像测试
          </h1>
          <p className="text-gray-600">
            验证用户头像显示逻辑是否正确
          </p>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2" />
            匹配用户列表 ({matchedUsers.length} 人)
          </h2>

          {matchedUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无匹配用户</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {matchedUsers.map((user) => {
                const avatarUrl = getAvatarUrl(user)
                
                return (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      {/* 头像 */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('头像加载失败:', user.name, 'URL:', avatarUrl)
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) {
                                  fallback.style.display = 'flex'
                                }
                              }}
                              onLoad={() => {
                                console.log('头像加载成功:', user.name, 'URL:', avatarUrl)
                              }}
                            />
                          ) : null}
                          <span 
                            className="text-pink-600 font-bold text-xl"
                            style={{ display: avatarUrl ? 'none' : 'flex' }}
                          >
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* 用户信息 */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <span className="text-sm text-gray-500">{user.age}岁</span>
                          {user.isOnline && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              在线
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{user.location}</p>
                        <p className="text-sm text-gray-500">{user.bio}</p>
                      </div>

                      {/* 头像信息 */}
                      <div className="text-right">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center space-x-1">
                            <ImageIcon size={12} />
                            <span>头像来源:</span>
                          </div>
                          {avatarUrl ? (
                            <div className="text-green-600 font-medium">
                              ✅ 用户照片
                            </div>
                          ) : (
                            <div className="text-orange-600 font-medium">
                              ⚠️ 默认字母
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 详细信息 */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">用户ID:</span>
                          <span className="text-gray-600 ml-2">{user.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">照片数量:</span>
                          <span className="text-gray-600 ml-2">{user.photos?.length || 0}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">头像URL:</span>
                          <span className="text-gray-600 ml-2">{user.avatar_url || '无'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">最终头像:</span>
                          <span className="text-gray-600 ml-2">{avatarUrl || '默认字母'}</span>
                        </div>
                      </div>
                      
                      {/* 照片列表 */}
                      {user.photos && user.photos.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700 text-sm">用户照片:</span>
                          <div className="flex space-x-2 mt-1">
                            {user.photos.map((photo, index) => (
                              <div key={index} className="w-8 h-8 bg-gray-200 rounded overflow-hidden">
                                <img 
                                  src={photo} 
                                  alt={`照片 ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 刷新按钮 */}
        <div className="text-center mt-6">
          <button
            onClick={fetchMatchedUsers}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            刷新用户列表
          </button>
        </div>
      </div>
    </div>
  )
} 