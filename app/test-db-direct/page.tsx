'use client'

import { useState } from 'react'

export default function TestDbDirect() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const testDbConnection = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setMessage(JSON.stringify(data, null, 2))
    } catch (error) {
      setMessage(`错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testProfileUpdate = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const testData = {
        bio: `测试bio - ${new Date().toISOString()}`,
        location: `测试位置 - ${new Date().toISOString()}`
      }

      console.log('发送测试数据:', testData)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      setMessage(JSON.stringify(data, null, 2))
    } catch (error) {
      setMessage(`错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testProfileGet = async () => {
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setMessage(JSON.stringify(data, null, 2))
    } catch (error) {
      setMessage(`错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">直接数据库测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          
          <div className="space-y-4">
            <button
              onClick={testDbConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '处理中...' : '🔗 测试数据库连接'}
            </button>

            <button
              onClick={testProfileUpdate}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '处理中...' : '💾 测试资料更新'}
            </button>

            <button
              onClick={testProfileGet}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? '处理中...' : '📥 测试资料获取'}
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {message}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 