'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  isRead: boolean
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
  const [lastMessageId, setLastMessageId] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取当前用户ID
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUserId(userData.id?.toString() || '')
    }
  }, [])

  // 改进的消息加载函数 - 智能合并，保证数据一致性
  const loadMessages = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    if (!userId || !currentUserId) {
      console.log('❌ [聊天面板] 加载消息条件不满足:', {
        hasUserId: !!userId,
        hasCurrentUserId: !!currentUserId
      })
      return
    }
    
    console.log(`📥 [聊天面板] 开始加载与用户 ${userId} 的聊天记录${forceRefresh ? ' (强制刷新)' : ''}`)
    
    // 只在初始加载或强制刷新时显示loading
    if (forceRefresh || isInitialLoad) {
      setLoading(true)
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [聊天面板] 没有找到token')
        return
      }

      console.log(`📤 [聊天面板] 发送API请求到 /api/messages/conversation?userId=${userId}`)

      const response = await fetch(`/api/messages/conversation?userId=${userId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log(`📡 [聊天面板] 获取聊天记录API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [聊天面板] 获取聊天记录API响应数据:`, data)
        
        if (data.success) {
          const serverMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.messageType || 'text',
            isRead: msg.isRead || false
          }))
          
          console.log(`✅ [聊天面板] 成功加载 ${serverMessages.length} 条聊天记录`)
          
          if (forceRefresh || isInitialLoad) {
            // 初始加载或强制刷新：直接设置服务器数据
            console.log(`🔄 [聊天面板] 初始加载/强制刷新 - 直接使用服务器数据`)
            setMessages(serverMessages)
            
            // 记录最新消息ID
            if (serverMessages.length > 0) {
              const latestMessage = serverMessages[serverMessages.length - 1]
              setLastMessageId(latestMessage.id)
              console.log(`📝 [聊天面板] 记录最新消息ID: ${latestMessage.id}`)
            }
            
            setIsInitialLoad(false)
          } else {
            // 增量更新：只添加新消息，保持现有消息
            console.log(`🔄 [聊天面板] 增量更新 - 检查新消息`)
            
            // 找出服务器有但本地没有的新消息
            const existingIds = new Set(messages.map(msg => msg.id))
            const newMessages = serverMessages.filter(msg => !existingIds.has(msg.id))
            
            if (newMessages.length > 0) {
              console.log(`🆕 [聊天面板] 发现 ${newMessages.length} 条新消息`)
              setMessages(prev => {
                // 合并现有消息和新消息，按时间排序
                const allMessages = [...prev, ...newMessages]
                const sortedMessages = allMessages.sort((a, b) => 
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
                
                // 去重（以防万一）
                const uniqueMessages = sortedMessages.reduce((acc, msg) => {
                  if (!acc.find(existing => existing.id === msg.id)) {
                    acc.push(msg)
                  }
                  return acc
                }, [] as Message[])
                
                console.log(`📝 [聊天面板] 合并后消息总数: ${uniqueMessages.length}`)
                return uniqueMessages
              })
              
              // 更新最新消息ID
              const latestNew = newMessages[newMessages.length - 1]
              setLastMessageId(latestNew.id)
            } else {
              console.log(`✅ [聊天面板] 没有新消息`)
            }
          }
        } else {
          console.error('❌ [聊天面板] 加载聊天记录失败:', data.error)
        }
      } else {
        console.error('❌ [聊天面板] 加载聊天记录请求失败，状态:', response.status)
        const errorText = await response.text()
        console.error('❌ [聊天面板] 错误详情:', errorText)
      }
    } catch (error) {
      console.error('❌ [聊天面板] 加载聊天记录异常:', error)
    } finally {
      if (forceRefresh || isInitialLoad) {
        setLoading(false)
      }
    }
  }, [currentUserId, isInitialLoad, messages])

  // 改进的实时消息检查 - 更频繁且智能
  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    const checkForNewMessages = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // 关键修复：始终获取完整消息历史，确保数据一致性
        const response = await fetch(`/api/messages/conversation?userId=${selectedUser.id}&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const serverMessages = data.messages || []
            
            // 检查是否有比本地最新消息更新的消息
            if (serverMessages.length > 0) {
              const serverLatestMessage = serverMessages[serverMessages.length - 1]
              
              // 如果服务器最新消息ID与本地记录不同，说明有新消息
              if (lastMessageId !== serverLatestMessage.id.toString()) {
                console.log(`🆕 [聊天面板] 检测到新消息，触发增量更新`)
                await loadMessages(selectedUser.id, false) // 增量更新
              }
            }
          }
        }
      } catch (error) {
        // 静默处理错误，避免干扰用户
        console.error('❌ [聊天面板] 检查新消息时出错:', error)
      }
    }

    // 立即检查一次
    checkForNewMessages()

    // 设置定时检查，每2秒检查一次
    const interval = setInterval(checkForNewMessages, 2000)

    return () => clearInterval(interval)
  }, [selectedUser, currentUserId, lastMessageId, loadMessages])

  // 当选择用户时初始化加载
  useEffect(() => {
    if (selectedUser && currentUserId) {
      console.log('🔄 选择用户，初始化加载聊天记录:', selectedUser.name, selectedUser.id)
      setIsInitialLoad(true)
      setMessages([]) // 清空之前的消息
      setLastMessageId(null) // 重置最新消息ID
      loadMessages(selectedUser.id, true) // 强制刷新
    }
  }, [selectedUser, currentUserId, loadMessages])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId || loading) {
      console.log('❌ [聊天面板] 发送消息条件不满足:', {
        hasMessage: !!newMessage.trim(),
        hasSelectedUser: !!selectedUser,
        hasCurrentUserId: !!currentUserId,
        loading
      })
      return
    }

    const messageContent = newMessage.trim()
    console.log(`💬 [聊天面板] 准备发送消息:`, {
      from: currentUserId,
      to: selectedUser.id,
      content: messageContent
    })

    // 生成临时ID用于乐观更新
    const tempId = `temp_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    }

    // 乐观更新：立即显示消息
    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [聊天面板] 没有找到token')
        alert('请重新登录')
        // 回滚乐观更新
        setMessages(prev => prev.filter(msg => msg.id !== tempId))
        setNewMessage(messageContent)
        setLoading(false)
        return
      }

      console.log(`📤 [聊天面板] 发送API请求到 /api/messages/send`)

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

      console.log(`📡 [聊天面板] API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [聊天面板] API响应数据:`, data)
        
        if (data.success) {
          // 用服务器返回的真实消息替换临时消息
          const realMessage: Message = {
            id: data.data.id.toString(),
            senderId: data.data.senderId,
            receiverId: data.data.receiverId,
            content: data.data.content,
            timestamp: new Date(data.data.timestamp),
            type: data.data.messageType || 'text',
            isRead: data.data.isRead
          }
          
          console.log('✅ [聊天面板] 消息发送成功，替换临时消息:', realMessage)
          
          // 替换临时消息为真实消息
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? realMessage : msg
          ))
          
          // 更新最新消息ID
          setLastMessageId(realMessage.id)
          console.log(`📝 [聊天面板] 更新最新消息ID: ${realMessage.id}`)
          
        } else {
          console.error('❌ [聊天面板] 发送消息失败:', data.error)
          alert('发送消息失败: ' + data.error)
          // 回滚乐观更新
          setMessages(prev => prev.filter(msg => msg.id !== tempId))
          setNewMessage(messageContent)
        }
      } else {
        console.error('❌ [聊天面板] 发送消息请求失败，状态:', response.status)
        const errorText = await response.text()
        console.error('❌ [聊天面板] 错误详情:', errorText)
        alert('发送消息失败，请重试')
        // 回滚乐观更新
        setMessages(prev => prev.filter(msg => msg.id !== tempId))
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('❌ [聊天面板] 发送消息异常:', error)
      alert('网络错误，请重试')
      // 回滚乐观更新
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

  // 手动刷新函数 - 强制重新加载所有消息
  const handleManualRefresh = async () => {
    if (!selectedUser) return
    console.log('🔄 [聊天面板] 手动强制刷新')
    await loadMessages(selectedUser.id, true)
  }

  // 格式化时间显示
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 已读状态指示器组件
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
                          <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-pink-200 rounded-full flex items-center justify-center overflow-hidden">
                            {user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600' ? (
                              <img 
                                src={user.photos[0]} 
                                alt={user.name}
                                className="w-full h-full object-cover"
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
                              className="text-red-600 font-semibold text-lg"
                              style={{ display: (user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                            >
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
                <div className="flex items-center justify-between p-4 border-b bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {selectedUser.photos && selectedUser.photos.length > 0 && selectedUser.photos[0] && selectedUser.photos[0] !== '/api/placeholder/400/600' ? (
                        <img 
                          src={selectedUser.photos[0]} 
                          alt={selectedUser.name}
                          className="w-full h-full object-cover"
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
                        style={{ display: (selectedUser.photos && selectedUser.photos.length > 0 && selectedUser.photos[0] && selectedUser.photos[0] !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                      >
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{selectedUser.name}</div>
                      <div className="text-sm text-gray-500">
                        {selectedUser.age}岁 • {selectedUser.location}
                        {selectedUser.isOnline && (
                          <span className="ml-2 text-green-500">• 在线</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleManualRefresh}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 disabled:opacity-50 rounded-lg transition-colors"
                      title="强制刷新消息"
                    >
                      {loading ? '刷新中...' : '🔄 刷新'}
                    </button>
                    <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg">
                      已匹配
                    </span>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
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
                        } ${
                          message.id.startsWith('temp_') ? 'opacity-70' : ''
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.senderId === currentUserId 
                            ? 'text-red-100' 
                            : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUserId && !message.id.startsWith('temp_') && (
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? '发送中...' : '发送'}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    按 Enter 发送 • 自动检查新消息每2秒 • 优化实时同步
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