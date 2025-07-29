'use client'

import { useState } from 'react'

export default function TestAvatarAPI() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAPI = async () => {
    setIsLoading(true)
    try {
      // 测试API端点是否存在
      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      })

      const data = await response.json()
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testEnvironment = async () => {
    setIsLoading(true)
    try {
      // 测试环境变量
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setTestResult({
        type: 'environment_test',
        status: response.status,
        data: data
      })
    } catch (error) {
      setTestResult({
        type: 'environment_test',
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            头像上传API诊断
          </h1>

          <div className="space-y-4 mb-8">
            <button
              onClick={testAPI}
              disabled={isLoading}
              className="w-full p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isLoading ? '测试中...' : '测试头像上传API'}
            </button>

            <button
              onClick={testEnvironment}
              disabled={isLoading}
              className="w-full p-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isLoading ? '测试中...' : '测试环境变量'}
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">测试结果</h3>
              <pre className="text-sm text-gray-700 overflow-auto max-h-96">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">可能的问题</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• Supabase Storage未设置</li>
              <li>• 环境变量未配置</li>
              <li>• 用户未登录</li>
              <li>• 文件格式不支持</li>
              <li>• 文件大小超限</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 