'use client'

import { useState, useEffect } from 'react'

export default function DebugToken() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [decodedToken, setDecodedToken] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 从localStorage获取token
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    setToken(storedToken)
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('解析用户数据失败:', error)
      }
    }

    // 解码JWT token
    if (storedToken) {
      try {
        const base64Url = storedToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        
        setDecodedToken(JSON.parse(jsonPayload))
      } catch (error) {
        console.error('解码token失败:', error)
        setMessage('Token解码失败')
      }
    }
  }, [])

  const testToken = async () => {
    if (!token) {
      setMessage('没有找到token')
      return
    }

    try {
      setMessage('测试token中...')
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessage('Token有效！API调用成功')
        console.log('API响应:', data)
      } else {
        const errorData = await response.json()
        setMessage(`Token无效: ${response.status} - ${errorData.error}`)
      }
    } catch (error) {
      setMessage(`测试失败: ${error}`)
    }
  }

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      setMessage('Token已复制到剪贴板')
    }
  }

  const clearToken = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setDecodedToken(null)
    setMessage('Token已清除')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">JWT Token 调试工具</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Token 状态</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Token 存在:</label>
            <p className={`text-lg ${token ? 'text-green-600' : 'text-red-600'}`}>
              {token ? '✅ 是' : '❌ 否'}
            </p>
          </div>

          {message && (
            <div className="p-3 bg-blue-100 border border-blue-300 rounded mb-4">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          <div className="flex space-x-4 mb-4">
            <button
              onClick={testToken}
              disabled={!token}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              测试 Token
            </button>
            
            <button
              onClick={copyToken}
              disabled={!token}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              复制 Token
            </button>
            
            <button
              onClick={clearToken}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              清除 Token
            </button>
          </div>
        </div>

        {token && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">JWT Token</h2>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono break-all">
                {token}
              </div>
            </div>

            {decodedToken && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">解码后的 Token 内容</h2>
                <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
                </div>
              </div>
            )}
          </>
        )}

        {user && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">localStorage 中的用户数据</h2>
            <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">如何手动查看 Token</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>打开浏览器开发者工具 (F12)</li>
            <li>切换到 &quot;Application&quot; 或 &quot;存储&quot; 标签</li>
            <li>在左侧找到 &quot;Local Storage&quot;</li>
            <li>点击你的网站域名</li>
            <li>找到名为 &quot;token&quot; 的键</li>
            <li>值就是你的 JWT token</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 