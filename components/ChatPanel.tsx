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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 模拟消息数据
  useEffect(() => {
    if (selectedUser) {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: selectedUser.id,
          receiverId: 'current-user',
          content: '你好！很高兴认识你 😊',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: '2',
          senderId: 'current-user',
          receiverId: selectedUser.id,
          content: '你好！我也很高兴认识你',
          timestamp: new Date(Date.now() - 3500000),
          type: 'text'
        },
        {
          id: '3',
          senderId: selectedUser.id,
          receiverId: 'current-user',
          content: '看到你的资料，我们有很多共同的兴趣爱好呢',
          timestamp: new Date(Date.now() - 3000000),
          type: 'text'
        }
      ]
      setMessages(mockMessages)
    }
  }, [selectedUser])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'current-user',
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // 模拟回复
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: selectedUser.id,
          receiverId: 'current-user',
          content: '收到你的消息了！我正在回复...',
          timestamp: new Date(),
          type: 'text'
        }
        setMessages(prev => [...prev, reply])
      }, 2000)
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
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === 'current-user'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'current-user' 
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
                      disabled={!newMessage.trim()}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
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