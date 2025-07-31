'use client'

import { useState, useEffect } from 'react'

export default function DebugVerificationCodes() {
  const [emailCodes, setEmailCodes] = useState<any[]>([])
  const [smsCodes, setSmsCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCodes = async () => {
    try {
      // 这里我们需要通过API来获取验证码状态
      // 由于验证码存储在内存中，我们需要添加一个调试端点
      const response = await fetch('/api/debug/verification-codes')
      if (response.ok) {
        const data = await response.json()
        setEmailCodes(data.emailCodes || [])
        setSmsCodes(data.smsCodes || [])
      }
    } catch (error) {
      console.error('获取验证码状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
    const interval = setInterval(fetchCodes, 5000) // 每5秒刷新一次
    return () => clearInterval(interval)
  }, [])

  const clearAllCodes = async () => {
    try {
      await fetch('/api/debug/clear-verification-codes', { method: 'POST' })
      fetchCodes()
    } catch (error) {
      console.error('清除验证码失败:', error)
    }
  }

  if (loading) {
    return <div className="p-8">加载中...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">验证码调试页面</h1>
      
      <div className="mb-6">
        <button
          onClick={fetchCodes}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          刷新状态
        </button>
        <button
          onClick={clearAllCodes}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          清除所有验证码
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 邮箱验证码 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">邮箱验证码 ({emailCodes.length})</h2>
          {emailCodes.length === 0 ? (
            <p className="text-gray-500">暂无邮箱验证码</p>
          ) : (
            <div className="space-y-3">
              {emailCodes.map((item, index) => (
                <div key={index} className="border p-3 rounded">
                  <p><strong>邮箱:</strong> {item.email}</p>
                  <p><strong>验证码:</strong> {item.code}</p>
                  <p><strong>创建时间:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                  <p><strong>过期时间:</strong> {new Date(item.expires).toLocaleString()}</p>
                  <p><strong>状态:</strong> 
                    <span className={Date.now() > item.expires ? 'text-red-500' : 'text-green-500'}>
                      {Date.now() > item.expires ? '已过期' : '有效'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 短信验证码 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">短信验证码 ({smsCodes.length})</h2>
          {smsCodes.length === 0 ? (
            <p className="text-gray-500">暂无短信验证码</p>
          ) : (
            <div className="space-y-3">
              {smsCodes.map((item, index) => (
                <div key={index} className="border p-3 rounded">
                  <p><strong>手机号:</strong> {item.phone}</p>
                  <p><strong>验证码:</strong> {item.code}</p>
                  <p><strong>创建时间:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                  <p><strong>过期时间:</strong> {new Date(item.expires).toLocaleString()}</p>
                  <p><strong>状态:</strong> 
                    <span className={Date.now() > item.expires ? 'text-red-500' : 'text-green-500'}>
                      {Date.now() > item.expires ? '已过期' : '有效'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">常见问题说明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>验证码存储在内存中，服务器重启会丢失</li>
          <li>开发环境热重载可能导致验证码丢失</li>
          <li>验证码有效期为10分钟</li>
          <li>如果验证码显示&quot;不存在或已过期&quot;，请重新发送</li>
        </ul>
      </div>
    </div>
  )
} 