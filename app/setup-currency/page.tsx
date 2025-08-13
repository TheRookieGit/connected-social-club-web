'use client'

import { useState } from 'react'

export default function SetupCurrencyPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkTables = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/currency/setup-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        setError(data.message || '检查失败')
      }
    } catch (err) {
      setError('网络错误: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            桃花币系统数据库设置
          </h1>
          <p className="text-gray-600 mb-6">
            此页面将检查桃花币系统所需的数据库表是否存在，并提供创建缺失表的SQL命令。
          </p>
          
          <button
            onClick={checkTables}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
          >
            {loading ? '检查中...' : '检查数据库表'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-red-800 font-medium">错误</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* 检查结果摘要 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">检查结果</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-green-800 font-medium">已存在的表</div>
                  <div className="text-green-700 text-2xl font-bold">{results.existingTables?.length || 0}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="text-yellow-800 font-medium">缺失的表</div>
                  <div className="text-yellow-700 text-2xl font-bold">{results.missingTables?.length || 0}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="text-blue-800 font-medium">总表数</div>
                  <div className="text-blue-700 text-2xl font-bold">{results.results?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* 详细结果 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">详细状态</h2>
              <div className="space-y-3">
                {results.results?.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <span className="font-medium">{result.table}</span>
                      <span className="text-gray-600 ml-2">- {result.message}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'exists' ? 'bg-green-100 text-green-800' :
                      result.status === 'missing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.status === 'exists' ? '已存在' :
                       result.status === 'missing' ? '缺失' : '错误'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL命令 */}
            {results.sqlCommands && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">创建缺失表的SQL命令</h2>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">{results.sqlCommands}</pre>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-blue-800 font-medium mb-2">执行步骤：</h3>
                  <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                    <li>登录您的Supabase控制台</li>
                    <li>进入SQL编辑器</li>
                    <li>复制上面的SQL命令</li>
                    <li>粘贴到编辑器中并执行</li>
                    <li>执行完成后，返回此页面重新检查</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 成功消息 */}
            {results.missingTables?.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-green-800 font-medium">✅ 所有表都已存在！</h3>
                <p className="text-green-700 mt-1">
                  桃花币系统的所有数据库表都已正确设置。您现在可以正常使用桃花币功能了。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 