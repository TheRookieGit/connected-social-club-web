'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  id: number
  name: string
  email: string
  bio?: string
  location?: string
  birth_date?: string
  gender?: string
  avatar_url?: string
  occupation?: string
  education?: string
  relationship_status?: string
  height?: number
  weight?: number
}

export default function TestProfileUpdate() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [testBio, setTestBio] = useState('')

  const fetchProfile = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('获取个人资料响应:', data)
        const userData = data.user || data
        setProfile(userData)
        setTestBio(userData.bio || '')
        setMessage(`✅ 获取成功 - bio: "${userData.bio || '空'}"`)
      } else {
        const errorData = await response.json()
        setMessage(`❌ 获取失败: ${response.status} - ${errorData.error}`)
      }
    } catch (error) {
      setMessage(`❌ 异常: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const updateData = {
        bio: testBio,
        location: '测试位置',
        occupation: '测试职业'
      }

      console.log('发送更新数据:', updateData)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedResponse = await response.json()
        console.log('更新个人资料响应:', updatedResponse)
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
        setMessage(`✅ 更新成功 - bio: "${updatedUserData.bio || '空'}"`)
      } else {
        const errorData = await response.json()
        setMessage(`❌ 更新失败: ${response.status} - ${errorData.error}`)
      }
    } catch (error) {
      setMessage(`❌ 异常: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearBio = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const updateData = {
        bio: null
      }

      console.log('清除bio数据:', updateData)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedResponse = await response.json()
        console.log('清除bio响应:', updatedResponse)
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
        setTestBio('')
        setMessage(`✅ 清除成功 - bio: "${updatedUserData.bio || '空'}"`)
      } else {
        const errorData = await response.json()
        setMessage(`❌ 清除失败: ${response.status} - ${errorData.error}`)
      }
    } catch (error) {
      setMessage(`❌ 异常: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">用户资料更新测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          
          <div className="space-y-4">
            <button
              onClick={fetchProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '处理中...' : '🔄 获取当前资料'}
            </button>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                测试 Bio 内容:
              </label>
              <textarea
                value={testBio}
                onChange={(e) => setTestBio(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="输入测试的bio内容..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? '处理中...' : '💾 更新资料'}
              </button>

              <button
                onClick={clearBio}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? '处理中...' : '🗑️ 清除 Bio'}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">当前用户资料</h2>
            <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 