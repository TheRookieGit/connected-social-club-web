'use client'

import { useState, useEffect } from 'react'
import { Heart, Users, Filter, Check, X } from 'lucide-react'

interface User {
  id: number
  name: string
  gender: string
  age: number
  bio?: string
  location?: string
  matchScore: number
  isMutualMatch?: boolean
  interests?: string[]
}

export default function TestRecommendationAlgorithm() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurrentUserAndPreferences()
  }, [])

  const fetchCurrentUserAndPreferences = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      // 获取当前用户信息
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setCurrentUser(userData.user)
        console.log('当前用户信息:', userData.user)
      }

      // 获取用户偏好
      const preferencesResponse = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json()
        setUserPreferences(preferencesData.preferences)
        console.log('用户偏好:', preferencesData.preferences)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      setError('获取用户信息失败')
    }
  }

  const testRecommendation = async () => {
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      const response = await fetch('/api/user/matches?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 转换数据格式
          const formattedUsers: User[] = data.users.map((user: any) => ({
            id: user.id,
            name: user.name,
            gender: user.gender,
            age: user.birth_date ? new Date().getFullYear() - new Date(user.birth_date).getFullYear() : 0,
            bio: user.bio,
            location: user.location,
            matchScore: user.matchScore,
            isMutualMatch: user.isMutualMatch,
            interests: user.interests
          }))

          setRecommendedUsers(formattedUsers)
          console.log('推荐用户:', formattedUsers)
        } else {
          setError(data.error || '获取推荐失败')
        }
      } else {
        setError('获取推荐失败')
      }
    } catch (error) {
      console.error('测试推荐算法失败:', error)
      setError('测试推荐算法失败')
    } finally {
      setIsLoading(false)
    }
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return '男性'
      case 'female': return '女性'
      case 'other': return '其他'
      default: return gender
    }
  }

  const getPreferenceText = (preferences: any) => {
    if (!preferences || !preferences.preferred_gender) return '未设置'
    
    const genders = preferences.preferred_gender
    if (genders.includes('everyone')) return '约会所有人'
    
    return genders.map((g: string) => getGenderText(g)).join('、')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 推荐算法测试
          </h1>
          <p className="text-gray-600">
            测试根据约会偏好过滤推荐用户的功能
          </p>
        </div>

        {/* 当前用户信息 */}
        {currentUser && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2" />
              当前用户信息
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>姓名:</strong> {currentUser.name}</p>
                <p><strong>性别:</strong> {getGenderText(currentUser.gender)}</p>
                <p><strong>年龄:</strong> {currentUser.birth_date ? new Date().getFullYear() - new Date(currentUser.birth_date).getFullYear() : '未知'}</p>
              </div>
              <div>
                <p><strong>约会偏好:</strong> {getPreferenceText(userPreferences)}</p>
                <p><strong>位置:</strong> {currentUser.location || '未设置'}</p>
                <p><strong>简介:</strong> {currentUser.bio || '未设置'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 测试按钮 */}
        <div className="text-center mb-6">
          <button
            onClick={testRecommendation}
            disabled={isLoading}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                测试中...
              </>
            ) : (
              <>
                <Filter className="mr-2" />
                测试推荐算法
              </>
            )}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 推荐结果 */}
        {recommendedUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="mr-2" />
              推荐用户 ({recommendedUsers.length} 人)
            </h2>
            
            {/* 统计信息 */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{recommendedUsers.filter(u => u.gender === 'male').length}</div>
                <div className="text-sm text-blue-600">男性用户</div>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{recommendedUsers.filter(u => u.gender === 'female').length}</div>
                <div className="text-sm text-pink-600">女性用户</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{recommendedUsers.filter(u => u.gender === 'other').length}</div>
                <div className="text-sm text-purple-600">其他性别</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{recommendedUsers.filter(u => u.isMutualMatch).length}</div>
                <div className="text-sm text-green-600">双向匹配</div>
              </div>
            </div>

            {/* 用户列表 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers.map((user) => (
                <div 
                  key={user.id} 
                  className={`border rounded-lg p-4 ${
                    user.isMutualMatch 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-1">
                      {user.isMutualMatch ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>性别:</strong> {getGenderText(user.gender)}</p>
                    <p><strong>年龄:</strong> {user.age}</p>
                    <p><strong>匹配度:</strong> {user.matchScore}%</p>
                    <p><strong>位置:</strong> {user.location || '未设置'}</p>
                    {user.bio && <p><strong>简介:</strong> {user.bio}</p>}
                    {user.interests && user.interests.length > 0 && (
                      <p><strong>兴趣:</strong> {user.interests.slice(0, 3).join(', ')}</p>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs">
                    {user.isMutualMatch ? (
                      <span className="text-green-600">✅ 双向匹配</span>
                    ) : (
                      <span className="text-red-600">❌ 单向匹配</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 