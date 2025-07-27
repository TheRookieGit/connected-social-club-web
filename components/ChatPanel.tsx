'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Smile, Paperclip, Heart, Clock, MapPin } from 'lucide-react'

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

  const formatLastSeen = (user: User) => {
    if (user.isOnline) return '在线'
    // 这里可以添加最后在线时间的逻辑
    return '离线'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">我的匹配</h3>
              <p className="text-sm text-gray-500">
                {matchedUsers.length > 0 
                  ? `${matchedUsers.length} 个已配对的用户等待聊天`
                  : '还没有匹配，去发现更多用户吧！'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 用户列表 */}
          <div className="w-96 border-r bg-gray-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">已配对用户</h4>
                <span className="text-sm text-gray-500 bg-red-100 px-2 py-1 rounded-full">
                  {matchedUsers.length}
                </span>
              </div>
              
              {matchedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-gray-400" size={24} />
                  </div>
                  <h5 className="font-medium text-gray-900 mb-2">暂无匹配</h5>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    还没有找到匹配的用户<br/>
                    继续浏览用户来寻找<br/>
                    你的完美匹配吧！
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matchedUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedUser?.id === user.id
                          ? 'bg-red-100 border-2 border-red-200 shadow-md'
                          : 'bg-white hover:bg-red-50 border-2 border-transparent shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-pink-200 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-semibold text-lg">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-semibold text-gray-900 truncate">{user.name}</h5>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{user.age}岁</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                            <MapPin size={12} />
                            <span className="truncate">{user.location}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <Clock size={10} />
                            <span className={user.isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}>
                              {formatLastSeen(user)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 聊天区域 */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* 聊天头部 */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-pink-200 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold text-lg">
                          {selectedUser.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{selectedUser.age}岁</span>
                          <span>•</span>
                          <span>{selectedUser.location}</span>
                          <span>•</span>
                          <span className={selectedUser.isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}>
                            {formatLastSeen(selectedUser)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                        已匹配
                      </div>
                    </div>
                  </div>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {loading && messages.length === 0 && (
                    <div className="flex justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                        <div className="text-gray-500 text-sm">加载聊天记录中...</div>
                      </div>
                    </div>
                  )}
                  
                  {messages.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-red-500" size={24} />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-2">开始对话</h5>
                      <p className="text-sm text-gray-500">
                        你们已经匹配成功了！<br/>
                        发送第一条消息来打破沉默吧
                      </p>
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
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.senderId === currentUserId
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
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
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`给 ${selectedUser.name} 发送消息...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                        disabled={loading}
                      />
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="text-red-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    选择聊天对象
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    从左侧选择一个已匹配的用户<br/>
                    开始你们的精彩对话
                  </p>
                  {matchedUsers.length === 0 && (
                    <button
                      onClick={onClose}
                      className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      去寻找匹配
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 