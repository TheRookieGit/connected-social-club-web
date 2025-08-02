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

export default function DebugChatIssue() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
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
      const response = await fetch('/api/user/matched-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMatchedUsers(data.matchedUsers)
          console.log('匹配用户:', data.matchedUsers)
        }
      }
    } catch (error) {
      console.error('加载匹配用户失败:', error)
    }
  }

  const loadMessages = async (userId: string) => {
    if (!currentUser) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/messages/conversation?userId=${userId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
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
          
          setMessages(formattedMessages)
          
          // 收集调试信息
          setDebugInfo({
            currentUserId: currentUser.id,
            selectedUserId: userId,
            messageCount: formattedMessages.length,
            senderIds: Array.from(new Set(formattedMessages.map(m => m.senderId))),
            receiverIds: Array.from(new Set(formattedMessages.map(m => m.receiverId))),
            messages: formattedMessages.slice(-5) // 最近5条消息
          })
        }
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    console.log('选择用户:', user)
    setSelectedUser(user)
    loadMessages(user.id)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">聊天问题调试工具</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">当前用户信息</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>ID:</strong> {currentUser?.id}</p>
                <p><strong>姓名:</strong> {currentUser?.name}</p>
                <p><strong>邮箱:</strong> {currentUser?.email}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">调试信息</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>匹配用户数量:</strong> {matchedUsers.length}</p>
                <p><strong>选中用户:</strong> {selectedUser?.name || '无'}</p>
                <p><strong>消息数量:</strong> {messages.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 匹配用户列表 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">匹配用户列表</h2>
            <div className="space-y-2">
              {matchedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.photos && user.photos.length > 0 ? (
                        <img 
                          src={user.photos[0]} 
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.age}岁 • {user.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">消息列表</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                选择用户查看消息
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.senderId === currentUser?.id?.toString()
                        ? 'bg-blue-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-500">
                        {message.senderId === currentUser?.id?.toString() ? '我' : '对方'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {message.id} | 发送者: {message.senderId} | 接收者: {message.receiverId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 调试信息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">详细调试信息</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">用户ID对比</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>当前用户ID: {debugInfo.currentUserId}</p>
                  <p>选中用户ID: {debugInfo.selectedUserId}</p>
                  <p>类型匹配: {debugInfo.currentUserId === debugInfo.selectedUserId ? '❌ 相同' : '✅ 不同'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">消息发送者ID</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {debugInfo.senderIds?.map((id: string) => (
                    <p key={id}>• {id} {id === debugInfo.currentUserId ? '✅ 当前用户' : ''}</p>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">消息接收者ID</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {debugInfo.receiverIds?.map((id: string) => (
                    <p key={id}>• {id} {id === debugInfo.currentUserId ? '✅ 当前用户' : ''}</p>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">最近消息</h3>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                  {debugInfo.messages?.map((msg: Message) => (
                    <div key={msg.id} className="border-l-2 border-gray-300 pl-2">
                      <p><strong>ID:</strong> {msg.id}</p>
                      <p><strong>发送者:</strong> {msg.senderId}</p>
                      <p><strong>接收者:</strong> {msg.receiverId}</p>
                      <p><strong>内容:</strong> {msg.content.substring(0, 30)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 