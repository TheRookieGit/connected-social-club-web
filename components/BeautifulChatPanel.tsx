'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Smile, Paperclip, Heart, Clock, MapPin, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

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

interface BeautifulChatPanelProps {
  matchedUsers: User[]
  initialUserId?: string
  isOpen: boolean
  onClose: () => void
}

export default function BeautifulChatPanel({ matchedUsers, initialUserId, isOpen, onClose }: BeautifulChatPanelProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [lastMessageId, setLastMessageId] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [windowHeight, setWindowHeight] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 确保只在客户端渲染
  useEffect(() => {
    setWindowHeight(window.innerHeight)
    const updateWindowHeight = () => setWindowHeight(window.innerHeight)
    window.addEventListener('resize', updateWindowHeight)
    return () => window.removeEventListener('resize', updateWindowHeight)
  }, [])

  // 获取当前用户ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          const userData = data.user || data
          setCurrentUserId(userData.id?.toString() || '')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  // 如果有初始用户ID，自动选择
  useEffect(() => {
    if (initialUserId && matchedUsers.length > 0) {
      const targetUser = matchedUsers.find(user => user.id === initialUserId)
      if (targetUser) {
        setSelectedUser(targetUser)
      }
    }
  }, [initialUserId, matchedUsers])

  // 改进的消息加载函数
  const loadMessages = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    if (!userId || !currentUserId) {
      console.log('❌ [聊天面板] 加载消息条件不满足:', {
        hasUserId: !!userId,
        hasCurrentUserId: !!currentUserId
      })
      return
    }
    
    console.log(`📥 [聊天面板] 开始加载与用户 ${userId} 的聊天记录${forceRefresh ? ' (强制刷新)' : ''}`)
    
    if (forceRefresh || isInitialLoad) {
      setLoading(true)
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [聊天面板] 没有找到token')
        return
      }

      const response = await fetch(`/api/messages/conversation?userId=${userId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          const serverMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            senderId: msg.senderId.toString(),
            receiverId: msg.receiverId.toString(),
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.messageType || 'text',
            isRead: msg.isRead || false
          }))
          
          console.log(`✅ [聊天面板] 成功加载 ${serverMessages.length} 条聊天记录`)
          
          if (forceRefresh || isInitialLoad) {
            setMessages(serverMessages)
            
            if (serverMessages.length > 0) {
              const latestMessage = serverMessages[serverMessages.length - 1]
              setLastMessageId(latestMessage.id)
            }
            
            setIsInitialLoad(false)
          } else {
            const existingIds = new Set(messages.map(msg => msg.id))
            const newMessages = serverMessages.filter(msg => !existingIds.has(msg.id))
            
            if (newMessages.length > 0) {
              console.log(`🆕 [聊天面板] 发现 ${newMessages.length} 条新消息`)
              setMessages(prev => {
                const allMessages = [...prev, ...newMessages]
                const sortedMessages = allMessages.sort((a, b) => 
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
                
                const uniqueMessages = sortedMessages.reduce((acc, msg) => {
                  if (!acc.find(existing => existing.id === msg.id)) {
                    acc.push(msg)
                  }
                  return acc
                }, [] as Message[])
                
                return uniqueMessages
              })
              
              const latestNew = newMessages[newMessages.length - 1]
              setLastMessageId(latestNew.id)
            }
          }
        } else {
          console.error('❌ [聊天面板] 加载聊天记录失败:', data.error)
        }
      } else {
        console.error('❌ [聊天面板] 加载聊天记录请求失败，状态:', response.status)
      }
    } catch (error) {
      console.error('❌ [聊天面板] 加载聊天记录异常:', error)
    } finally {
      if (forceRefresh || isInitialLoad) {
        setLoading(false)
      }
    }
  }, [currentUserId, isInitialLoad, messages])

  // 监听selectedUser变化，自动加载对应消息
  useEffect(() => {
    if (selectedUser && currentUserId) {
      console.log(`🔄 [聊天面板] selectedUser变化，重新加载消息:`, {
        selectedUserId: selectedUser.id,
        currentUserId: currentUserId
      })
      setMessages([])
      setIsInitialLoad(true)
      loadMessages(selectedUser.id, true)
    }
  }, [selectedUser?.id, currentUserId, loadMessages])

  // 实时消息检查
  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    const checkForNewMessages = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`/api/messages/conversation?userId=${selectedUser.id}&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const serverMessages = data.messages || []
            
            if (serverMessages.length > 0) {
              const serverLatestMessage = serverMessages[serverMessages.length - 1]
              
              if (lastMessageId !== serverLatestMessage.id.toString()) {
                console.log(`🆕 [聊天面板] 检测到新消息，触发增量更新`)
                await loadMessages(selectedUser.id, false)
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ [聊天面板] 检查新消息时出错:', error)
      }
    }

    checkForNewMessages()
    const interval = setInterval(checkForNewMessages, 2000)
    return () => clearInterval(interval)
  }, [selectedUser, currentUserId, lastMessageId, loadMessages])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId || loading) {
      return
    }

    const messageContent = newMessage.trim()
    const tempId = `temp_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId.toString(),
      receiverId: selectedUser.id.toString(),
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    }

    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [聊天面板] 没有找到token')
        alert('请重新登录')
        setMessages(prev => prev.filter(msg => msg.id !== tempId))
        setNewMessage(messageContent)
        setLoading(false)
        return
      }

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
          const realMessage: Message = {
            id: data.data.id.toString(),
            senderId: data.data.senderId.toString(),
            receiverId: data.data.receiverId.toString(),
            content: data.data.content,
            timestamp: new Date(data.data.timestamp),
            type: data.data.messageType || 'text',
            isRead: data.data.isRead
          }
          
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? realMessage : msg
          ))
          
          setLastMessageId(realMessage.id)
          
        } else {
          console.error('❌ [聊天面板] 发送消息失败:', data.error)
          alert('发送消息失败: ' + data.error)
          setMessages(prev => prev.filter(msg => msg.id !== tempId))
          setNewMessage(messageContent)
        }
      } else {
        console.error('❌ [聊天面板] 发送消息请求失败，状态:', response.status)
        alert('发送消息失败，请重试')
        setMessages(prev => prev.filter(msg => msg.id !== tempId))
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('❌ [聊天面板] 发送消息异常:', error)
      alert('网络错误，请重试')
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      setNewMessage(messageContent)
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

  const handleManualRefresh = async () => {
    if (!selectedUser) return
    console.log('🔄 [聊天面板] 手动强制刷新')
    await loadMessages(selectedUser.id, true)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const ReadStatusIndicator = ({ isRead }: { isRead: boolean }) => {
    if (isRead) {
      return (
        <div className="flex items-center" title="已读">
          <svg width="16" height="12" viewBox="0 0 16 12" className="text-blue-300">
            <path
              d="M15.03 1.47a.75.75 0 010 1.06l-9 9a.75.75 0 01-1.06 0l-4-4a.75.75 0 011.06-1.06L5.5 9.94 13.97 1.47a.75.75 0 011.06 0z"
              fill="currentColor"
            />
            <path
              d="M12.03 1.47a.75.75 0 010 1.06l-6 6a.75.75 0 01-1.06 0l-1-1a.75.75 0 011.06-1.06L6.5 7.94 10.97 3.47a.75.75 0 011.06 0z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="flex items-center" title="已发送">
          <svg width="12" height="9" viewBox="0 0 12 9" className="text-gray-400">
            <path
              d="M11.03 1.47a.75.75 0 010 1.06l-6 6a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L4.5 6.94 9.97 1.47a.75.75 0 011.06 0z"
              fill="currentColor"
            />
          </svg>
        </div>
      )
    }
  }

  const formatLastSeen = (user: User) => {
    if (user.isOnline) return '在线'
    return '离线'
  }

  if (!isOpen) return null

  return (
    <>
      {/* LinkedIn风格的右侧用户头像列表 */}
      <div className="fixed bottom-0 right-0 w-80 bg-white shadow-lg border-l border-gray-200 z-40 flex flex-col" 
           style={{ 
             maxHeight: isPanelCollapsed ? 'auto' : (windowHeight > 0 ? `${windowHeight * 0.8}px` : '80vh'),
             minHeight: isPanelCollapsed ? 'auto' : '400px',
             height: isPanelCollapsed ? 'auto' : (matchedUsers.length > 0 ? `${Math.min(matchedUsers.length * 80 + 100, windowHeight > 0 ? windowHeight * 0.8 : 800)}px` : '400px')
           }}>
        {/* 头部 */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle size={18} />
              <div className="text-sm font-medium">
                我的匹配
              </div>
            </div>
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              {isPanelCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* 用户头像和名字列表 */}
        <div className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${isPanelCollapsed ? 'hidden' : 'block'}`}>
          {matchedUsers.length > 0 ? (
            <div className="space-y-4">
              {matchedUsers.map((user) => (
                <div
                  key={user.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-sm font-bold text-pink-600 overflow-hidden border-2 border-transparent group-hover:border-pink-300 transition-colors">
                        {user.photos && user.photos.length > 0 ? (
                          <img 
                            src={user.photos[0]} 
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) {
                                fallback.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-sm font-bold text-pink-600"
                          style={{ display: (user.photos && user.photos.length > 0) ? 'none' : 'flex' }}
                        >
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.bio || '这个人很神秘...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 text-center">
              <Heart size={16} className="text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">暂无匹配</p>
            </div>
          )}
        </div>
      </div>

      {/* 聊天框 */}
      {selectedUser && (
        <div
          className="fixed bottom-0 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col"
          style={{ right: 336 + 20 }}
        >
          {/* 聊天框头部 */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageCircle size={14} />
              </div>
              <span className="text-base font-medium">
                {selectedUser.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 聊天内容 */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                    <div className="text-gray-500 text-sm">加载聊天记录中...</div>
                  </div>
                </div>
              )}
              
              {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-pink-500" size={24} />
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
                    message.senderId.toString() === currentUserId.toString() ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderId.toString() === currentUserId.toString()
                        ? 'bg-pink-500 text-white rounded-br-sm'
                        : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                    } ${
                      message.id.startsWith('temp_') ? 'opacity-70' : ''
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      message.senderId.toString() === currentUserId.toString()
                        ? 'text-pink-100' 
                        : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {message.senderId.toString() === currentUserId.toString() && !message.id.startsWith('temp_') && (
                        <div className="flex items-center ml-2">
                          <ReadStatusIndicator isRead={message.isRead} />
                        </div>
                      )}
                      {message.id.startsWith('temp_') && (
                        <span className="text-xs opacity-60">发送中...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 消息输入区域 */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`给 ${selectedUser.name} 发送消息...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 