'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [status, setStatus] = useState('加载中...')
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // 检查环境变量
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    }
    setEnvVars(env)

    // 测试基本功能
    try {
      setStatus('页面加载成功！')
    } catch (error) {
      setStatus(`错误: ${error}`)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">调试页面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">页面状态</h2>
          <p className="text-green-600 font-medium">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">环境变量</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className={value === '未设置' ? 'text-red-600' : 'text-green-600'}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">浏览器信息</h2>
          <div className="space-y-2">
            <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : '服务器端'}</div>
            <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : '服务器端'}</div>
            <div><strong>时间:</strong> {new Date().toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <strong>说明:</strong> 如果这个页面能正常显示，说明Next.js基本功能正常。如果显示空白，可能是构建或依赖问题。
        </div>
      </div>
    </div>
  )
} 