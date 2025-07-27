'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Smile, Paperclip } from 'lucide-react'

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
}

interface ChatPanelProps {
  matchedUsers: User[]
  onClose: () => void
}

export default function ChatPanel({ matchedUsers, onClose }: ChatPanelProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取当前用户ID
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUserId(userData.id?.toString() || '')
    }
  }, [])

  // 加载聊天记录
  const loadMessages = async (userId: string) => {
    if (!userId || !currentUserId) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages/conversation?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.messageType || 'text'
          }))
          setMessages(formattedMessages)
          console.log('✅ 加载聊天记录:', formattedMessages)
        } else {
          console.error('❌ 加载聊天记录失败:', data.error)
        }
      }
    } catch (error) {
      console.error('❌ 加载聊天记录错误:', error)
    } finally {
      setLoading(false)
    }
  }

  // 当选择用户时加载聊天记录
  useEffect(() => {
    if (selectedUser && currentUserId) {
      console.log('🔄 选择用户，加载聊天记录:', selectedUser.name, selectedUser.id)
      loadMessages(selectedUser.id)
    }
  }, [selectedUser, currentUserId])

  // 定期刷新消息（每10秒）
  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    const interval = setInterval(() => {
      console.log('🔄 定期刷新消息...')
      loadMessages(selectedUser.id)
    }, 10000) // 每10秒刷新一次

    return () => clearInterval(interval)
  }, [selectedUser, currentUserId])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId || loading) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(selectedUser.id),
          message: messageContent,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 添加新消息到本地状态
          const newMessage: Message = {
            id: data.data.id.toString(),
            senderId: currentUserId,
            receiverId: selectedUser.id,
            content: messageContent,
            timestamp: new Date(data.data.timestamp),
            type: 'text'
          }
          setMessages(prev => [...prev, newMessage])
          console.log('✅ 消息发送成功:', newMessage)
        } else {
          console.error('❌ 发送消息失败:', data.error)
          alert('发送消息失败: ' + data.error)
          setNewMessage(messageContent) // 恢复消息内容
        }
      } else {
        console.error('❌ 发送消息请求失败')
        alert('发送消息失败，请重试')
        setNewMessage(messageContent) // 恢复消息内容
      }
    } catch (error) {
      console.error('❌ 发送消息错误:', error)
      alert('网络错误，请重试')
      setNewMessage(messageContent) // 恢复消息内容
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">聊天</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 用户列表 */}
          <div className="w-80 border-r bg-gray-50">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">匹配的用户</h4>
              <div className="space-y-2">
                {matchedUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-red-100 border-red-200'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{user.name}</h5>
                        <p className="text-sm text-gray-500">{user.age}岁 · {user.location}</p>
                      </div>
                      {user.isOnline && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 聊天区域 */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* 聊天头部 */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-medium">
                        {selectedUser.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedUser.name}</h4>
                      <p className="text-sm text-gray-500">
                        {selectedUser.isOnline ? '在线' : '离线'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading && messages.length === 0 && (
                    <div className="flex justify-center py-4">
                      <div className="text-gray-500">加载聊天记录中...</div>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === currentUserId
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === currentUserId 
                            ? 'text-red-100' 
                            : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-500 text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    选择聊天对象
                  </h3>
                  <p className="text-gray-500">
                    从左侧选择一个匹配的用户开始聊天
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 