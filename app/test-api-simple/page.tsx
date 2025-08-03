'use client'

import { useState, useEffect } from 'react'

export default function TestApiSimple() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string>('')

  useEffect(() => {
    const testApi = async () => {
      try {
        // 测试API是否可访问
        const response = await fetch('/api/user/matches?limit=1')
        const data = await response.json()
        
        if (response.ok) {
          setApiStatus(`API正常，状态码: ${response.status}`)
        } else {
          setApiStatus(`API错误，状态码: ${response.status}, 错误: ${data.error || '未知错误'}`)
        }
      } catch (error) {
        setError(`网络错误: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  if (loading) {
    return <div className="p-8">测试API连接中...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API连接测试</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>错误:</strong> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">API状态</h2>
        <div className="space-y-2">
          <div><strong>状态:</strong> {apiStatus}</div>
          <div><strong>当前时间:</strong> {new Date().toLocaleString()}</div>
          <div><strong>页面URL:</strong> {window.location.href}</div>
        </div>
      </div>

      <div className="mt-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <strong>说明:</strong> 这个页面测试API连接是否正常。如果API正常但需要登录，请先登录后再访问其他测试页面。
      </div>
    </div>
  )
} 