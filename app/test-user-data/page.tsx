'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  photos?: string[]
  bio?: string
  location?: string
  birth_date?: string
  [key: string]: any
}

export default function TestUserData() {
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('未找到登录令牌')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('用户资料API返回的完整数据:', data)
          
          if (data.success) {
            setUserData(data.user)
          } else {
            setError(data.error || '获取用户资料失败')
          }
        } else {
          setError(`API请求失败: ${response.status}`)
        }
      } catch (error) {
        setError(`网络错误: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载用户数据中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ 错误</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">用户资料数据测试</h1>
          <p className="text-gray-600 mb-6">检查用户资料API返回的完整数据</p>
        </div>

        {userData && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
                  <p className="text-gray-900">{userData.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <p className="text-gray-900">{userData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <p className="text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                  <p className="text-gray-900">{userData.location || '未设置'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  <p className="text-gray-900">{userData.bio || '未设置'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                  <p className="text-gray-900">{userData.birth_date || '未设置'}</p>
                </div>
              </div>
            </div>

            {/* 头像信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">头像信息</h2>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {userData.avatar_url ? (
                    <Image
                      src={userData.avatar_url}
                      alt="头像"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        console.log('头像加载失败')
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-500">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">头像URL</p>
                  <p className="text-sm text-gray-900 break-all">
                    {userData.avatar_url || '未设置'}
                  </p>
                </div>
              </div>
            </div>

            {/* 照片信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">照片信息</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">照片数量: {userData.photos?.length || 0}</p>
                <p className="text-sm text-gray-600 mb-4">照片数组: {JSON.stringify(userData.photos)}</p>
              </div>
              
              {userData.photos && userData.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userData.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={photo}
                        alt={`照片 ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`照片 ${index + 1} 加载失败:`, photo)
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">没有照片</p>
                </div>
              )}
            </div>

            {/* 完整数据 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">完整数据</h2>
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
                  点击查看完整的用户数据
                </summary>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 