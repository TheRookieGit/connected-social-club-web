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
  updated_at?: string
}

export default function TestVercelCache() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [testBio, setTestBio] = useState('')
  const [lastFetchTime, setLastFetchTime] = useState<string>('')

  const fetchProfile = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const timestamp = Date.now()
      console.log(`🔄 开始获取个人资料... 时间戳: ${timestamp}`)

      const response = await fetch(`/api/user/profile?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      console.log('📡 获取资料API响应状态:', response.status)
      console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 获取个人资料响应:', data)
        const userData = data.user || data
        setProfile(userData)
        setTestBio(userData.bio || '')
        setLastFetchTime(new Date().toLocaleString())
        setMessage(`✅ 获取成功 - bio: "${userData.bio || '空'}" - 更新时间: ${userData.updated_at}`)
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
        location: `测试位置 - ${new Date().toLocaleString()}`,
        occupation: `测试职业 - ${new Date().toLocaleString()}`
      }

      console.log('发送更新数据:', updateData)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(updateData)
      })

      console.log('📡 更新API响应状态:', response.status)
      console.log('📡 更新响应头:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const updatedResponse = await response.json()
        console.log('✅ 更新个人资料响应:', updatedResponse)
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
        setMessage(`✅ 更新成功 - bio: "${updatedUserData.bio || '空'}" - 更新时间: ${updatedUserData.updated_at}`)
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
    setTestBio('')
    const updateData = {
      bio: '',
      location: '已清除',
      occupation: '已清除'
    }

    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedResponse = await response.json()
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
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

  const forceRefresh = async () => {
    // 强制刷新，清除所有可能的缓存
    setMessage('🔄 强制刷新中...')
    await fetchProfile()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Vercel缓存问题测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={fetchProfile}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '处理中...' : '🔄 获取当前资料'}
              </button>

              <button
                onClick={forceRefresh}
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {loading ? '处理中...' : '⚡ 强制刷新'}
              </button>
            </div>

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">状态信息</h2>
          
          <div className="space-y-2 text-sm">
            <p><strong>最后获取时间:</strong> {lastFetchTime || '未获取'}</p>
            <p><strong>当前状态:</strong> {loading ? '加载中...' : '就绪'}</p>
            <p><strong>消息:</strong> {message || '无'}</p>
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">当前用户资料</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID:</label>
                <p className="text-gray-900">{profile.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">姓名:</label>
                <p className="text-gray-900">{profile.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">邮箱:</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio:</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">
                  {profile.bio || '空'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">位置:</label>
                <p className="text-gray-900">{profile.location || '未设置'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">职业:</label>
                <p className="text-gray-900">{profile.occupation || '未设置'}</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">最后更新时间:</label>
                <p className="text-gray-900">{profile.updated_at || '未知'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 