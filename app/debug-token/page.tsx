'use client'

import { useState, useEffect } from 'react'

export default function DebugTokenPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // 解析JWT token
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          setTokenInfo({
            token: token.substring(0, 50) + '...',
            payload,
            isValid: true
          })
        } else {
          setTokenInfo({
            token: token,
            error: 'Token格式不正确'
          })
        }
      } catch (error) {
        setTokenInfo({
          token: token,
          error: 'Token解析失败: ' + (error instanceof Error ? error.message : String(error))
        })
      }
    } else {
      setTokenInfo({
        error: '没有找到token'
      })
    }
  }, [])

  const clearToken = () => {
    localStorage.removeItem('token')
    setTokenInfo(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Token调试</h1>
        
        {tokenInfo ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Token信息</h2>
              <p className="text-sm text-gray-600">Token: {tokenInfo.token}</p>
              {tokenInfo.error && (
                <p className="text-red-600 text-sm mt-2">{tokenInfo.error}</p>
              )}
            </div>

            {tokenInfo.payload && (
              <div className="bg-green-50 p-4 rounded">
                <h2 className="font-semibold mb-2">Token内容</h2>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(tokenInfo.payload, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded">
              <h2 className="font-semibold mb-2">操作</h2>
              <button
                onClick={clearToken}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清除Token
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded">
            <p className="text-red-600">没有找到token，请重新登录</p>
          </div>
        )}
      </div>
    </div>
  )
} 