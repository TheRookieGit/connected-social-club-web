'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  isOnline: boolean
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  type: 'text' | 'image'
  isRead: boolean
}

export default function TestChatDisplay() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      alert('请先登录')
      router.push('/')
      return
    }

    const userData = JSON.parse(user)
    setCurrentUser(userData)
    
    // 加载匹配用户
    loadMatchedUsers(token)
  }, [router])

  const loadMatchedUsers = async (token: string) => {
    try {
      console.log('🔍 开始加载匹配用户...')
      const response = await fetch('/api/user/matched-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 匹配用户API响应状态:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📨 匹配用户API响应数据:', data)
        
        if (data.success) {
          setMatchedUsers(data.matchedUsers)
          console.log('✅ 成功加载匹配用户:', data.matchedUsers)
        } else {
          console.error('❌ 加载匹配用户失败:', data.error)
        }
      } else {
        console.error('❌ 匹配用户API请求失败:', response.status)
        const errorText = await response.text()
        console.error('❌ 错误详情:', errorText)
      }
    } catch (error) {
      console.error('❌ 加载匹配用户异常:', error)
    }
  }

  const loadMessages = async (userId: string) => {
    if (!currentUser) {
      console.log('❌ 当前用户未加载')
      return
    }

    console.log(`📥 开始加载与用户 ${userId} 的聊天记录`)
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ 没有找到token')
        return
      }

      const response = await fetch(`/api/messages/conversation?userId=${userId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 聊天记录API响应状态:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📨 聊天记录API响应数据:', data)
        
        if (data.success) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            senderId: msg.senderId.toString(),
            receiverId: msg.receiverId.toString(),
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.messageType || 'text',
            isRead: msg.isRead || false
          }))
          
          console.log('✅ 格式化后的消息:', formattedMessages)
          setMessages(formattedMessages)
          
          // 更新调试信息
          setDebugInfo({
            apiResponse: data,
            formattedMessages: formattedMessages,
            messageCount: formattedMessages.length,
            currentUserId: currentUser.id,
            selectedUserId: userId
          })
        } else {
          console.error('❌ 加载聊天记录失败:', data.error)
          setDebugInfo({ error: data.error })
        }
      } else {
        console.error('❌ 聊天记录API请求失败:', response.status)
        const errorText = await response.text()
        console.error('❌ 错误详情:', errorText)
        setDebugInfo({ error: `API请求失败: ${response.status}` })
      }
    } catch (error) {
      console.error('❌ 加载聊天记录异常:', error)
      setDebugInfo({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    console.log('👤 选择用户:', user)
    setSelectedUser(user)
    setMessages([]) // 清空之前的消息
    loadMessages(user.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) {
      console.log('❌ 发送消息条件不满足')
      return
    }

    console.log(`💬 准备发送消息: ${newMessage}`)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(selectedUser.id),
          message: newMessage.trim(),
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('✅ 消息发送成功:', data)
          setNewMessage('')
          // 重新加载消息
          await loadMessages(selectedUser.id)
        } else {
          console.error('❌ 发送消息失败:', data.error)
          alert('发送失败: ' + data.error)
        }
      } else {
        console.error('❌ 发送消息API请求失败:', response.status)
        alert('发送失败，请重试')
      }
    } catch (error) {
      console.error('❌ 发送消息异常:', error)
      alert('网络错误，请重试')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">聊天显示测试</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 用户列表 */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">匹配用户 ({matchedUsers.length})</h2>
              {matchedUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无匹配用户
                </div>
              ) : (
                <div className="space-y-2">
                  {matchedUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.age}岁 • {user.location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 聊天区域 */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="bg-white rounded-lg border h-96 flex flex-col">
                  {/* 聊天头部 */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedUser.name}</h3>
                        <p className="text-sm text-gray-500">{selectedUser.age}岁 • {selectedUser.location}</p>
                      </div>
                      <button
                        onClick={() => loadMessages(selectedUser.id)}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        {loading ? '加载中...' : '刷新'}
                      </button>
                    </div>
                  </div>

                  {/* 消息列表 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading && messages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">加载中...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        暂无消息，开始对话吧！
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === currentUser?.id?.toString() ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.senderId === currentUser?.id?.toString()
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-70 mt-1">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 消息输入 */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="输入消息..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        发送
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>请选择一个用户开始聊天</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 调试信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">调试信息</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 