'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestChatDebug() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      alert('请先登录')
      router.push('/')
      return
    }
  }, [router])

  const loadDebugData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/debug/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDebugData(data.data)
          console.log('✅ 调试数据加载成功:', data.data)
        } else {
          setError(data.error)
          console.error('❌ 调试数据加载失败:', data.error)
        }
      } else {
        const errorText = await response.text()
        setError(`API请求失败: ${response.status}`)
        console.error('❌ API请求失败:', response.status, errorText)
      }
    } catch (error) {
      setError('网络错误')
      console.error('❌ 网络错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">聊天调试工具</h1>
          
          <button
            onClick={loadDebugData}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-6"
          >
            {loading ? '加载中...' : '加载调试数据'}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {debugData && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">基本信息</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>当前用户ID: {debugData.currentUserId}</div>
                  <div>匹配数量: {debugData.matches.length}</div>
                  <div>总消息数: {debugData.totalMessages}</div>
                  <div>对话数量: {debugData.conversations.length}</div>
                </div>
              </div>

              {/* 匹配列表 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">匹配列表</h2>
                <div className="space-y-2">
                  {debugData.matches.map((match: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="text-sm">
                        <span className="font-medium">ID:</span> {match.id} | 
                        <span className="font-medium">用户ID:</span> {match.user_id} | 
                        <span className="font-medium">匹配用户ID:</span> {match.matched_user_id} | 
                        <span className="font-medium">状态:</span> {match.match_status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 对话列表 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">对话列表</h2>
                <div className="space-y-4">
                  {debugData.conversations.map((conv: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">用户ID: {conv.userId}</h3>
                          {conv.userInfo && (
                            <div className="text-sm text-gray-600">
                              姓名: {conv.userInfo.name} | 邮箱: {conv.userInfo.email} | 
                              在线: {conv.userInfo.is_online ? '是' : '否'}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          消息数: {conv.messageCount}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">最近消息:</h4>
                        {conv.messages.map((msg: any, msgIndex: number) => (
                          <div key={msgIndex} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className="font-medium">ID:</span> {msg.id} | 
                                <span className="font-medium">发送者:</span> {msg.senderId} | 
                                <span className="font-medium">接收者:</span> {msg.receiverId}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(msg.timestamp)}
                              </div>
                            </div>
                            <div className="mt-1">
                              <span className="font-medium">内容:</span> {msg.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              类型: {msg.messageType} | 已读: {msg.isRead ? '是' : '否'} | 
                              已删除: {msg.isDeleted ? '是' : '否'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 所有消息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">最近20条消息</h2>
                <div className="space-y-2">
                  {debugData.allMessages.map((msg: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium">ID:</span> {msg.id} | 
                            <span className="font-medium">发送者:</span> {msg.senderId} | 
                            <span className="font-medium">接收者:</span> {msg.receiverId}
                          </div>
                          <div className="mt-1">
                            <span className="font-medium">内容:</span> {msg.content}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 