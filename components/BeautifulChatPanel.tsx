'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  X, 
  Send, 
  Heart, 
  Clock, 
  MapPin, 
  MoreVertical, 
  Pin, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Smile,
  Paperclip
} from 'lucide-react'

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

interface ChatConversation {
  user: User
  messages: Message[]
  unreadCount: number
  isPinned: boolean
  lastMessage?: Message
  isMarkedAsUnread: boolean
}

interface ChatPanelProps {
  matchedUsers: User[]
  onClose: () => void
}

export default function BeautifulChatPanel({ matchedUsers, onClose }: ChatPanelProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  // const [searchTerm, setSearchTerm] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null)

  // 获取当前用户ID
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setCurrentUserId(userData.id?.toString() || '')
    }
  }, [])

  // 初始化对话列表
  useEffect(() => {
    if (matchedUsers.length > 0 && currentUserId) {
      const initialConversations: ChatConversation[] = matchedUsers.map(user => ({
        user,
        messages: [],
        unreadCount: Math.floor(Math.random() * 5), // 模拟未读消息数
        isPinned: Math.random() > 0.7, // 30%概率置顶
        isMarkedAsUnread: false
      }))
      setConversations(initialConversations)
    }
  }, [matchedUsers, currentUserId])

  // 加载消息
  const loadMessages = useCallback(async (userId: string) => {
    if (!userId || !currentUserId) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/messages/conversation?userId=${userId}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
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
          
          setConversations(prev => prev.map(conv => 
            conv.user.id === userId 
              ? { 
                  ...conv, 
                  messages: serverMessages,
                  lastMessage: serverMessages[serverMessages.length - 1],
                  unreadCount: serverMessages.filter(m => !m.isRead && m.senderId !== currentUserId).length
                }
              : conv
          ))
        }
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  // 发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId || loading) return

    const messageContent = newMessage.trim()
    const tempId = `temp_${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      receiverId: selectedConversation.user.id,
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    }

    // 乐观更新
    setConversations(prev => prev.map(conv => 
      conv.user.id === selectedConversation.user.id
        ? { 
            ...conv, 
            messages: [...conv.messages, optimisticMessage],
            lastMessage: optimisticMessage
          }
        : conv
    ))
    setNewMessage('')

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
          receiverId: parseInt(selectedConversation.user.id),
          message: messageContent,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const realMessage: Message = {
            id: data.data.id.toString(),
            senderId: data.data.senderId,
            receiverId: data.data.receiverId,
            content: data.data.content,
            timestamp: new Date(data.data.timestamp),
            type: data.data.messageType || 'text',
            isRead: data.data.isRead
          }
          
          setConversations(prev => prev.map(conv => 
            conv.user.id === selectedConversation.user.id
              ? { 
                  ...conv, 
                  messages: conv.messages.map(msg => 
                    msg.id === tempId ? realMessage : msg
                  ),
                  lastMessage: realMessage
                }
              : conv
          ))
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  // 删除对话
  const deleteConversation = (userId: string) => {
    setConversations(prev => prev.filter(conv => conv.user.id !== userId))
    if (selectedConversation?.user.id === userId) {
      setSelectedConversation(null)
    }
    setShowUserMenu(null)
  }

  // 置顶/取消置顶对话
  const togglePinConversation = (userId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.user.id === userId 
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    ))
    setShowUserMenu(null)
  }

  // 标为已读/未读
  const toggleReadStatus = (userId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.user.id === userId 
        ? { 
            ...conv, 
            isMarkedAsUnread: !conv.isMarkedAsUnread,
            unreadCount: conv.isMarkedAsUnread ? conv.unreadCount : 0
          }
        : conv
    ))
    setShowUserMenu(null)
  }

  // 标记所有消息为已读
  const markAllAsRead = (userId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.user.id === userId 
        ? { 
            ...conv, 
            unreadCount: 0,
            messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
          }
        : conv
    ))
  }

  // 选择对话
  const selectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation)
    if (conversation.unreadCount > 0) {
      markAllAsRead(conversation.user.id)
    }
    loadMessages(conversation.user.id)
  }

  // 过滤对话列表
  const filteredConversations = conversations.filter(conv => {
    // const matchesSearch = conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUnreadFilter = !showUnreadOnly || conv.unreadCount > 0 || conv.isMarkedAsUnread
    const matchesPinnedFilter = !showPinnedOnly || conv.isPinned
    // return matchesSearch && matchesUnreadFilter && matchesPinnedFilter
    return matchesUnreadFilter && matchesPinnedFilter
  })

  // 排序对话列表（置顶优先，然后按最后消息时间）
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    }
    return 0
  })

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString()
    }
  }

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-pink-100">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">甜蜜聊天</h2>
              <p className="text-pink-100 text-sm">
                {conversations.length} 个匹配 • {conversations.filter(c => c.unreadCount > 0).length} 个未读
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 对话列表 */}
          <div className="w-96 bg-gradient-to-b from-pink-50 to-rose-50 border-r border-pink-200 flex flex-col">
            {/* 搜索和过滤 */}
            <div className="p-4 space-y-3">
              {/* 搜索功能已注释掉 */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" size={18} />
                <input
                  type="text"
                  placeholder="搜索用户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                />
              </div> */}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showUnreadOnly 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  <Bell size={14} className="inline mr-1" />
                  未读
                </button>
                <button
                  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showPinnedOnly 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  <Pin size={14} className="inline mr-1" />
                  置顶
                </button>
              </div>
            </div>

            {/* 对话列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {sortedConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-pink-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无对话</h3>
                  <p className="text-gray-500 text-sm">开始寻找你的完美匹配吧！</p>
                </div>
              ) : (
                sortedConversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    className={`relative group cursor-pointer transition-all duration-200 ${
                      selectedConversation?.user.id === conversation.user.id
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                        : 'bg-white hover:bg-pink-50 border border-pink-100 hover:border-pink-200'
                    } rounded-2xl p-4`}
                    onClick={() => selectConversation(conversation)}
                  >
                    {/* 置顶标识 */}
                    {conversation.isPinned && (
                      <div className="absolute top-2 right-2">
                        <Pin size={12} className="text-pink-500" />
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      {/* 头像 */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          selectedConversation?.user.id === conversation.user.id
                            ? 'bg-white text-pink-500'
                            : 'bg-gradient-to-br from-pink-200 to-rose-200 text-pink-600'
                        }`}>
                          {conversation.user.name.charAt(0)}
                        </div>
                        {conversation.user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* 用户信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold truncate ${
                            selectedConversation?.user.id === conversation.user.id
                              ? 'text-white'
                              : 'text-gray-900'
                          }`}>
                            {conversation.user.name}
                          </h4>
                          <span className={`text-xs ${
                            selectedConversation?.user.id === conversation.user.id
                              ? 'text-pink-100'
                              : 'text-gray-500'
                          }`}>
                            {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin size={12} className={selectedConversation?.user.id === conversation.user.id ? 'text-pink-200' : 'text-gray-400'} />
                          <span className={`text-xs truncate ${
                            selectedConversation?.user.id === conversation.user.id
                              ? 'text-pink-200'
                              : 'text-gray-500'
                          }`}>
                            {conversation.user.location}
                          </span>
                        </div>

                        {/* 最后消息 */}
                        {conversation.lastMessage && (
                          <p className={`text-sm truncate ${
                            selectedConversation?.user.id === conversation.user.id
                              ? 'text-pink-100'
                              : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.senderId === currentUserId ? '你: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>

                      {/* 未读消息数和操作按钮 */}
                      <div className="flex flex-col items-end space-y-2">
                        {(conversation.unreadCount > 0 || conversation.isMarkedAsUnread) && (
                          <div className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {conversation.unreadCount || '!'}
                          </div>
                        )}
                        
                        {/* 操作菜单 */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowUserMenu(showUserMenu === conversation.user.id ? null : conversation.user.id)
                            }}
                            className={`p-1 rounded-full transition-all duration-200 ${
                              selectedConversation?.user.id === conversation.user.id
                                ? 'text-white hover:bg-white hover:bg-opacity-20'
                                : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {showUserMenu === conversation.user.id && (
                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-10 min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  togglePinConversation(conversation.user.id)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50 flex items-center space-x-2"
                              >
                                <Pin size={14} />
                                <span>{conversation.isPinned ? '取消置顶' : '置顶对话'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleReadStatus(conversation.user.id)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50 flex items-center space-x-2"
                              >
                                {conversation.isMarkedAsUnread ? <EyeOff size={14} /> : <Eye size={14} />}
                                <span>{conversation.isMarkedAsUnread ? '标为已读' : '标为未读'}</span>
                              </button>
                              <div className="border-t border-pink-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteConversation(conversation.user.id)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                              >
                                <Trash2 size={14} />
                                <span>删除对话</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 聊天区域 */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* 聊天头部 */}
                <div className="flex items-center justify-between p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center text-pink-600 font-semibold">
                      {selectedConversation.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedConversation.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {selectedConversation.user.age}岁 • {selectedConversation.user.location}
                        {selectedConversation.user.isOnline && (
                          <span className="ml-2 text-green-500">• 在线</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedConversation.unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead(selectedConversation.user.id)}
                        className="px-3 py-1 text-xs bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      >
                        标为已读
                      </button>
                    )}
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm rounded-lg">
                      已匹配
                    </span>
                  </div>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-25 to-white">
                  {loading && selectedConversation.messages.length === 0 && (
                    <div className="flex justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                        <div className="text-gray-500 text-sm">加载聊天记录中...</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedConversation.messages.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-pink-500" size={32} />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-2">开始甜蜜对话</h5>
                      <p className="text-sm text-gray-500">
                        你们已经匹配成功了！<br/>
                        发送第一条消息来打破沉默吧 💕
                      </p>
                    </div>
                  )}
                  
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.senderId === currentUserId
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                            : 'bg-white text-gray-900 border border-pink-100'
                        } ${
                          message.id.startsWith('temp_') ? 'opacity-70' : ''
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.senderId === currentUserId 
                            ? 'text-pink-100' 
                            : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUserId && !message.id.startsWith('temp_') && (
                            <div className="flex items-center ml-2">
                              {message.isRead ? (
                                <CheckCheck size={14} className="text-blue-300" />
                              ) : (
                                <Check size={14} className="text-gray-300" />
                              )}
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
                <div className="p-4 border-t border-pink-100 bg-white">
                  <div className="flex space-x-3">
                    <button className="p-2 text-pink-400 hover:bg-pink-50 rounded-lg transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <button className="p-2 text-pink-400 hover:bg-pink-50 rounded-lg transition-colors">
                      <ImageIcon size={20} />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`给 ${selectedConversation.user.name} 发送消息...`}
                      className="flex-1 px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                      disabled={loading}
                    />
                    <button className="p-2 text-pink-400 hover:bg-pink-50 rounded-lg transition-colors">
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-pink-25 to-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="text-pink-500" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    选择聊天对象
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-lg">
                    从左侧选择一个已匹配的用户<br/>
                    开始你们的甜蜜对话 💕
                  </p>
                  {conversations.length === 0 && (
                    <button
                      onClick={onClose}
                      className="mt-8 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
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