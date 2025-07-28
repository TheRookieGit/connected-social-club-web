'use client'

import { useState, useEffect } from 'react'

export default function QuickChatTest() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [targetUserId, setTargetUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLog(prev => [...prev, `${timestamp}: ${message}`])
  }

  const loadMessages = async () => {
    if (!targetUserId || !user) return

    const token = localStorage.getItem('token')
    if (!token) {
      addLog('❌ 未找到token')
      return
    }

    try {
      addLog('📥 开始加载消息...')
      const response = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        addLog(`✅ 成功加载 ${data.messages?.length || 0} 条消息 (总计: ${data.total})`)
        
        if (data.messages && data.messages.length > 0) {
          const latest = data.messages[data.messages.length - 1]
          addLog(`📋 最新消息: ID:${latest.id} - "${latest.content}"`)
        }
      } else {
        addLog(`❌ 加载失败: ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ 加载异常: ${error}`)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !targetUserId || !user) {
      alert('请填写完整信息')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('未找到token')
      return
    }

    setLoading(true)
    const messageContent = newMessage.trim()
    addLog(`📤 发送消息: "${messageContent}"`)

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(targetUserId),
          message: messageContent,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          addLog(`✅ 发送成功! 消息ID: ${data.data.id}`)
          setNewMessage('')
          
          // 立即重新加载消息
          setTimeout(() => {
            addLog('🔄 立即重新加载消息验证...')
            loadMessages()
          }, 500)
        } else {
          addLog(`❌ 发送失败: ${data.error}`)
        }
      } else {
        addLog(`❌ 发送请求失败: ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ 发送异常: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testRefresh = () => {
    addLog('🔄 模拟页面刷新 - 重新加载消息...')
    loadMessages()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🚀 快速聊天测试</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-green-900">当前用户: {user.name} (ID: {user.id})</h2>
            </div>
          )}

          {/* 控制面板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">测试控制</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标用户ID
                </label>
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="输入要聊天的用户ID (如: 6 或 7)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  消息内容
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="输入要发送的消息"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={sendMessage}
                  disabled={loading || !user}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '发送中...' : '发送消息'}
                </button>
                
                <button
                  onClick={loadMessages}
                  disabled={!user}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  加载消息
                </button>
                
                <button
                  onClick={testRefresh}
                  disabled={!user}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  测试刷新
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">操作日志</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg h-48 overflow-y-auto font-mono text-sm">
                {log.length === 0 ? (
                  <div className="text-gray-500">操作日志将显示在这里...</div>
                ) : (
                  log.map((entry, index) => (
                    <div key={index} className="mb-1">{entry}</div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 消息显示 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              消息列表 ({messages.length} 条)
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  还没有消息，发送第一条消息开始测试
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.senderId === user?.id?.toString()
                          ? 'bg-blue-500 text-white ml-12'
                          : 'bg-white text-gray-900 mr-12 border'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {message.senderId === user?.id?.toString() ? '我' : `用户${message.senderId}`}
                        <span className="ml-2 opacity-75">#{message.id}</span>
                      </div>
                      <div className="mt-1">{message.content}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 测试说明 */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🎯 测试步骤</h3>
            <ol className="text-yellow-700 text-sm space-y-1">
              <li>1. 输入目标用户ID (如果你是用户6，就输入7；如果你是用户7，就输入6)</li>
              <li>2. 点击&quot;加载消息&quot;查看现有消息</li>
              <li>3. 输入新消息内容，点击&quot;发送消息&quot;</li>
              <li>4. 观察消息是否立即出现在列表中</li>
              <li>5. 点击&quot;测试刷新&quot;模拟页面刷新</li>
              <li>6. 检查消息是否仍然存在</li>
            </ol>
            <div className="mt-3 text-yellow-800 font-medium">
              ✅ 如果发送的消息能立即显示且刷新后不消失，说明问题已修复！
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 