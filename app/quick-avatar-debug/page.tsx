'use client'

import { useState } from 'react'

export default function QuickAvatarDebug() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug-avatar-upload')
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({
        error: '调试失败',
        details: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            头像上传快速诊断
          </h1>

          <button
            onClick={runDebug}
            disabled={isLoading}
            className="w-full p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors mb-8"
          >
            {isLoading ? '诊断中...' : '运行诊断'}
          </button>

          {debugResult && (
            <div className="space-y-6">
              {/* 环境变量检查 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">环境变量检查</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(debugResult.environment || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className={`font-bold ${value === '已设置' ? 'text-green-600' : 'text-red-600'}`}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 连接状态 */}
              {debugResult.supabase_connection && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Supabase连接</h3>
                  <p className="text-green-700">{debugResult.supabase_connection}</p>
                </div>
              )}

              {/* 存储桶状态 */}
              {debugResult.storage_bucket && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">存储桶状态</h3>
                  {typeof debugResult.storage_bucket === 'string' ? (
                    <p className="text-red-600 font-bold">{debugResult.storage_bucket}</p>
                  ) : (
                    <div className="space-y-2">
                      <p><span className="font-medium">ID:</span> {debugResult.storage_bucket.id}</p>
                      <p><span className="font-medium">名称:</span> {debugResult.storage_bucket.name}</p>
                      <p><span className="font-medium">公开:</span> {debugResult.storage_bucket.public ? '是' : '否'}</p>
                      <p><span className="font-medium">文件大小限制:</span> {debugResult.storage_bucket.file_size_limit} bytes</p>
                      <p><span className="font-medium">允许的文件类型:</span> {debugResult.storage_bucket.allowed_mime_types?.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 用户表状态 */}
              {debugResult.user_table && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">用户表状态</h3>
                  <p className="text-green-700">{debugResult.user_table}</p>
                </div>
              )}

              {/* 错误信息 */}
              {debugResult.errors && debugResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">发现的问题</h3>
                  <ul className="space-y-2">
                    {debugResult.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-700">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 原始数据 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">完整诊断结果</h3>
                <pre className="text-sm text-gray-700 overflow-auto max-h-96 bg-white p-4 rounded border">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 快速修复建议 */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">快速修复建议</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• 如果存储桶不存在，运行 <code className="bg-yellow-100 px-2 py-1 rounded">setup_avatar_storage.sql</code></li>
              <li>• 如果环境变量未设置，在Vercel Dashboard中配置</li>
              <li>• 如果权限错误，检查Supabase Storage策略设置</li>
              <li>• 如果连接失败，检查网络和API密钥</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 