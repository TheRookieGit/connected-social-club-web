'use client'

import { useState, useEffect } from 'react'

export default function DebugInconsistency() {
  const [user, setUser] = useState<any>(null)
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const runDebug = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('/api/debug-messages?userId1=6&userId2=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDebugData(data.debug)
        console.log('调试数据:', data.debug)
      } else {
        alert('调试失败: ' + response.status)
      }
    } catch (error) {
      alert('调试错误: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 消息不一致性调试</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900">当前用户: {user.name} (ID: {user.id})</h2>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={runDebug}
              disabled={loading || !user}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? '🔍 调试中...' : '🚀 开始深度调试'}
            </button>
          </div>

          {debugData && (
            <div className="space-y-6">
              {/* 统计信息 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-3">📊 数据库统计</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{debugData.statistics.total}</div>
                    <div className="text-sm text-gray-600">总消息数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{debugData.statistics.active}</div>
                    <div className="text-sm text-gray-600">活跃消息</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{debugData.statistics.deleted}</div>
                    <div className="text-sm text-gray-600">已删除</div>
                  </div>
                </div>
              </div>

              {/* 用户查询差异 */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-3">⚠️ 用户查询差异</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{debugData.userQueries.user1Count}</div>
                    <div className="text-sm text-gray-600">用户6看到的消息</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{debugData.userQueries.user2Count}</div>
                    <div className="text-sm text-gray-600">用户7看到的消息</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{debugData.userQueries.difference}</div>
                    <div className="text-sm text-gray-600">差异数量</div>
                  </div>
                </div>
                {debugData.userQueries.difference > 0 && (
                  <div className="mt-3 p-3 bg-red-100 rounded text-red-800 font-medium">
                    🚨 检测到数据不一致！不同用户看到的消息数量不同！
                  </div>
                )}
              </div>

              {/* 最新消息 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">📋 最新消息 (数据库原始)</h3>
                <div className="space-y-2">
                  {debugData.latestMessages.map((msg: any, index: number) => (
                    <div key={msg.id} className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            消息ID: {msg.id} | {msg.from} → {msg.to}
                            {msg.deleted && <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs">已删除</span>}
                          </div>
                          <div className="text-gray-700 mt-1">{msg.content}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(msg.created).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 原始数据 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">📄 原始数据 (最新10条)</h3>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm max-h-80 overflow-y-auto">
                  {debugData.rawData.allMessages.slice(-10).map((msg: any) => (
                    <div key={msg.id} className="mb-1">
                      ID:{msg.id} | {msg.sender_id}→{msg.receiver_id} | 删除:{msg.is_deleted ? 'Y' : 'N'} | &quot;{msg.message}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 这个工具会检查:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 数据库中的真实消息数量</li>
              <li>• 不同用户查询时看到的消息差异</li>
              <li>• 是否有权限过滤导致的问题</li>
              <li>• 消息的删除状态和完整性</li>
              <li>• 找出为什么刷新后消息会消失</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 