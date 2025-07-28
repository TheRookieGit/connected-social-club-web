'use client'

import { useState, useEffect } from 'react'

export default function TestProfileUpdate() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchProfile = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('未找到token，请先登录')
        return
      }

      console.log('测试: 获取用户资料...')
      const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('测试: 获取到的用户数据:', data)
        setUserData(data.user)
        setMessage('获取成功')
      } else {
        const errorData = await response.json()
        setMessage(`获取失败: ${response.status} - ${errorData.error}`)
      }
    } catch (error) {
      console.error('测试: 获取用户资料失败:', error)
      setMessage(`获取失败: ${error}`)
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
        setMessage('未找到token，请先登录')
        return
      }

      const testData = {
        bio: `测试更新 - ${new Date().toLocaleString()}`,
        location: '测试位置',
        occupation: '测试职业'
      }

      console.log('测试: 更新用户资料...', testData)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('测试: 更新响应:', data)
        setUserData(data.user)
        setMessage('更新成功')
      } else {
        const errorData = await response.json()
        setMessage(`更新失败: ${response.status} - ${errorData.error}`)
      }
    } catch (error) {
      console.error('测试: 更新用户资料失败:', error)
      setMessage(`更新失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">个人资料更新测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={fetchProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '获取用户资料'}
            </button>
            
            <button
              onClick={updateProfile}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '更新中...' : '测试更新'}
            </button>
          </div>
          
          {message && (
            <div className="p-3 bg-gray-100 rounded mb-4">
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>

        {userData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">当前用户数据</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="text-gray-900">{userData.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">姓名</label>
                <p className="text-gray-900">{userData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">邮箱</label>
                <p className="text-gray-900">{userData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">个人简介</label>
                <p className="text-gray-900">{userData.bio || '未设置'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">位置</label>
                <p className="text-gray-900">{userData.location || '未设置'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">职业</label>
                <p className="text-gray-900">{userData.occupation || '未设置'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">更新时间</label>
                <p className="text-gray-900">{userData.updated_at ? new Date(userData.updated_at).toLocaleString() : '未知'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">完整数据 (JSON)</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 