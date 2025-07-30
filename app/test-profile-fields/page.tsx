'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestProfileFields() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未找到登录令牌')
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取用户资料失败')
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      } else {
        setError(data.error || '获取用户资料失败')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6">用户资料字段测试</h1>
        
        {user && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">基本信息</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">姓名:</span> {user.name || '未设置'}
                </div>
                <div>
                  <span className="font-medium">邮箱:</span> {user.email || '未设置'}
                </div>
                <div>
                  <span className="font-medium">性别:</span> {user.gender || '未设置'}
                </div>
                <div>
                  <span className="font-medium">生日:</span> {user.birth_date || '未设置'}
                </div>
              </div>
            </div>

            {/* 家庭计划相关字段 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-blue-800">家庭计划相关字段</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">family_plans:</span> 
                  <span className="ml-2 text-blue-600">
                    {user.family_plans ? `"${user.family_plans}"` : 'null/undefined'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">has_kids:</span> 
                  <span className="ml-2 text-blue-600">
                    {user.has_kids !== undefined && user.has_kids !== null ? `"${user.has_kids}"` : 'null/undefined'}
                  </span>
                </div>
              </div>
            </div>

            {/* 约会目的相关字段 */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-green-800">约会目的相关字段</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">dating_style:</span> 
                  <span className="ml-2 text-green-600">
                    {user.dating_style ? `"${user.dating_style}"` : 'null/undefined'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">relationship_goals:</span> 
                  <span className="ml-2 text-green-600">
                    {user.relationship_goals ? JSON.stringify(user.relationship_goals) : 'null/undefined'}
                  </span>
                </div>
              </div>
            </div>

            {/* 其他相关字段 */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-yellow-800">其他相关字段</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">marital_status:</span> 
                  <span className="ml-2 text-yellow-600">
                    {user.marital_status ? `"${user.marital_status}"` : 'null/undefined'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">relationship_status:</span> 
                  <span className="ml-2 text-yellow-600">
                    {user.relationship_status ? `"${user.relationship_status}"` : 'null/undefined'}
                  </span>
                </div>
              </div>
            </div>

            {/* 原始数据 */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">完整用户数据</h2>
              <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={fetchUserProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            刷新数据
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
} 