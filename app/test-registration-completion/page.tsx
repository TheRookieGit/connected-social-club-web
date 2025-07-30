'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestRegistrationCompletion() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  const checkRegistrationCompletion = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.log('Profile API response not ok:', response.status)
        return false
      }

      const data = await response.json()
      if (!data.success || !data.user) {
        console.log('Profile API data not valid:', data)
        return false
      }

      const user = data.user
      setUserData(user)
      console.log('Checking registration completion for user:', user.id)
      
      // 检查注册完成的关键字段
      const hasBasicInfo = user.gender && user.birth_date
      const hasPreferences = user.preferences && (
        user.preferences.preferred_gender || 
        user.preferences.min_age || 
        user.preferences.max_age
      )
      const hasInterests = user.interests && user.interests.length > 0
      const hasValues = user.values_preferences && user.values_preferences.length > 0
      const hasLifestyle = user.smoking_status || user.drinking_status
      const hasFamilyPlans = user.family_plans || user.has_kids !== null
      const hasPhotos = user.photos && Array.isArray(user.photos) && user.photos.length >= 3

      console.log('Registration completion check:', {
        hasBasicInfo,
        hasPreferences,
        hasInterests,
        hasValues,
        hasLifestyle,
        hasFamilyPlans,
        hasPhotos,
        user: {
          gender: user.gender,
          birth_date: user.birth_date,
          preferences: user.preferences,
          interests: user.interests,
          values_preferences: user.values_preferences,
          smoking_status: user.smoking_status,
          drinking_status: user.drinking_status,
          family_plans: user.family_plans,
          has_kids: user.has_kids,
          photos: user.photos
        }
      })

      // 如果所有关键字段都已填写，则认为注册完成
      const isComplete = hasBasicInfo && hasPreferences && hasInterests && hasValues && 
                        hasLifestyle && hasFamilyPlans && hasPhotos
      
      console.log('Registration completion result:', isComplete)
      return isComplete
    } catch (error) {
      console.error('检查注册完成状态时出错:', error)
      return false
    }
  }

  const handleCheck = async () => {
    setLoading(true)
    setError('')
    
    const token = localStorage.getItem('token')
    if (!token) {
      setError('没有找到登录token')
      setLoading(false)
      return
    }

    try {
      const complete = await checkRegistrationCompletion(token)
      setIsComplete(complete)
    } catch (error) {
      setError('检查失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">注册完成状态测试</h1>
          
          <div className="space-y-4">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '检查中...' : '检查注册完成状态'}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
            >
              退出登录
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {isComplete !== null && (
              <div className={`border px-4 py-3 rounded ${
                isComplete ? 'bg-green-50 border-green-200 text-green-600' : 'bg-yellow-50 border-yellow-200 text-yellow-600'
              }`}>
                <h3 className="font-bold">
                  注册完成状态: {isComplete ? '已完成' : '未完成'}
                </h3>
                {!isComplete && (
                  <p className="mt-2 text-sm">
                    用户需要完成所有注册步骤才能直接跳转到dashboard
                  </p>
                )}
              </div>
            )}

            {userData && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">用户数据详情:</h3>
                <div className="bg-gray-50 p-4 rounded text-sm">
                  <pre className="whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 