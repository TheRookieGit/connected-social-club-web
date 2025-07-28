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
  isRead: boolean // 新增已读状态
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

  // 加载聊天记录 - 智能合并，避免覆盖本地新消息
  const loadMessages = async (userId: string, forceRefresh: boolean = false) => {
    if (!userId || !currentUserId) {
      console.log('❌ [聊天面板] 加载消息条件不满足:', {
        hasUserId: !!userId,
        hasCurrentUserId: !!currentUserId
      })
      return
    }
    
    console.log(`📥 [聊天面板] 开始加载与用户 ${userId} 的聊天记录${forceRefresh ? ' (强制刷新)' : ''}`)
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [聊天面板] 没有找到token')
        return
      }

      console.log(`📤 [聊天面板] 发送API请求到 /api/messages/conversation?userId=${userId}`)

      const response = await fetch(`/api/messages/conversation?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log(`📡 [聊天面板] 获取聊天记录API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [聊天面板] 获取聊天记录API响应数据:`, data)
        
        if (data.success) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id.toString(),
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.messageType || 'text',
            isRead: msg.isRead || false // 添加isRead属性
          }))
          
          console.log(`✅ [聊天面板] 成功加载 ${formattedMessages.length} 条聊天记录`)
          console.log(`📋 [聊天面板] 当前本地消息数量: ${messages.length}`)
          console.log(`📋 [聊天面板] 服务器消息数量: ${formattedMessages.length}`)
          
          if (forceRefresh) {
            // 强制刷新时直接覆盖
            setMessages(formattedMessages)
            console.log(`🔄 [聊天面板] 强制刷新 - 直接更新本地消息状态`)
          } else {
            // 智能合并：简化逻辑，优先保证消息不丢失
            console.log(`🔄 [聊天面板] 开始简化智能合并`)
            console.log(`📋 [聊天面板] 本地消息数: ${messages.length}, 服务器消息数: ${formattedMessages.length}`)
            
            // 如果服务器消息数量更多，直接使用服务器消息
            if (formattedMessages.length >= messages.length) {
              console.log(`✅ [聊天面板] 服务器消息更多，直接使用服务器数据`)
              setMessages(formattedMessages)
            } else {
              // 如果本地消息更多，保持本地消息不变
              console.log(`⚠️ [聊天面板] 本地消息更多，保持本地状态`)
              // 但是更新已读状态
              const updatedMessages = messages.map(localMsg => {
                const serverMsg = formattedMessages.find(sm => sm.id === localMsg.id)
                if (serverMsg && serverMsg.isRead !== localMsg.isRead) {
                  console.log(`📖 [聊天面板] 更新消息 ${localMsg.id} 已读状态: ${localMsg.isRead} → ${serverMsg.isRead}`)
                  return { ...localMsg, isRead: serverMsg.isRead }
                }
                return localMsg
              })
              setMessages(updatedMessages)
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
      setLoading(false)
    }
  }

  // 轻量级新消息检查（用于实时通信）
  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    const checkForNewMessages = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        console.log(`🔔 [聊天面板] 检查新消息 - 当前本地消息数量: ${messages.length}`)

        const response = await fetch(`/api/messages/conversation?userId=${selectedUser.id}&limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const serverMessages = data.messages || []
            console.log(`🔔 [聊天面板] 服务器消息数量: ${serverMessages.length}`)

            // 更保守的检查：只有当服务器明显有更多消息时才同步
            if (serverMessages.length > messages.length + 1) {
              console.log(`🆕 [聊天面板] 发现明显的新消息！服务器${serverMessages.length} > 本地${messages.length}+1`)
              // 使用非强制刷新
              await loadMessages(selectedUser.id, false)
            } else {
              console.log(`✅ [聊天面板] 消息基本同步`)
            }
          }
        }
      } catch (error) {
        console.error('❌ [聊天面板] 检查新消息错误:', error)
      }
    }

    // 减少检查频率：初始延迟5秒，然后每15秒检查一次
    const timeout = setTimeout(() => {
      const interval = setInterval(checkForNewMessages, 15000)
      
      console.log('🔔 [聊天面板] 新消息检查已启动（15秒间隔）')
      
      // 清理函数
      return () => {
        clearInterval(interval)
        console.log('🔔 [聊天面板] 新消息检查已停止')
      }
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [selectedUser, currentUserId])

  // 当选择用户时加载聊天记录
  useEffect(() => {
    if (selectedUser && currentUserId) {
      console.log('🔄 选择用户，强制加载聊天记录:', selectedUser.name, selectedUser.id)
      loadMessages(selectedUser.id, true) // 初始加载使用强制刷新
    }
  }, [selectedUser, currentUserId])

  // 定期刷新消息（暂时禁用以避免消息被覆盖）
  useEffect(() => {
    if (!selectedUser || !currentUserId) return

    // 暂时禁用定期刷新，避免消息被"吞掉"
    console.log('🚫 [聊天面板] 定期刷新已禁用，避免消息被覆盖')
    
    // const interval = setInterval(() => {
    //   console.log('🔄 [聊天面板] 定期刷新消息（30秒间隔）...')
    //   loadMessages(selectedUser.id)
    // }, 30000) // 改为30秒刷新一次，避免干扰用户

    // return () => clearInterval(interval)
  }, [selectedUser, currentUserId])

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

    // 先清空输入框，但保留消息内容用于恢复
    setNewMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [聊天面板] 没有找到token')
        alert('请重新登录')
        setNewMessage(messageContent) // 恢复消息
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
          // 立即添加新消息到本地状态（乐观更新）
          const newMessage: Message = {
            id: data.data.id.toString(),
            senderId: currentUserId,
            receiverId: selectedUser.id,
            content: messageContent,
            timestamp: new Date(data.data.timestamp),
            type: 'text',
            isRead: false // 新消息默认未读
          }
          
          console.log('✅ [聊天面板] 消息发送成功，立即添加到本地状态:', newMessage)
          
          // 检查是否已存在相同ID的消息
          const existingMessageIndex = messages.findIndex(msg => msg.id === newMessage.id)
          if (existingMessageIndex === -1) {
            // 消息不存在，添加到本地状态
            setMessages(prev => [...prev, newMessage])
            console.log('✅ [聊天面板] 新消息已添加到本地状态')
          } else {
            // 消息已存在，更新该消息
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id ? newMessage : msg
            ))
            console.log('✅ [聊天面板] 现有消息已更新')
          }
          
          // 不再自动重新加载，避免消息被"吞掉"
          console.log('✅ [聊天面板] 消息已保存到本地，依赖实时检查机制同步')
          
        } else {
          console.error('❌ [聊天面板] 发送消息失败:', data.error)
          alert('发送消息失败: ' + data.error)
          setNewMessage(messageContent) // 恢复消息内容
        }
      } else {
        console.error('❌ [聊天面板] 发送消息请求失败，状态:', response.status)
        const errorText = await response.text()
        console.error('❌ [聊天面板] 错误详情:', errorText)
        alert('发送消息失败，请重试')
        setNewMessage(messageContent) // 恢复消息内容
      }
    } catch (error) {
      console.error('❌ [聊天面板] 发送消息异常:', error)
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
          <svg width="12" height="9" viewBox="0 0 12 9" className="text-red-200">
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
                <div className="flex items-center justify-between p-4 border-b bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.name.charAt(0).toUpperCase()}
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
                      onClick={() => loadMessages(selectedUser.id, true)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="强制刷新聊天记录"
                    >
                      🔄
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
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.senderId === currentUserId 
                            ? 'text-red-100' 
                            : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUserId && (
                            <div className="flex items-center ml-2">
                              {message.isRead ? (
                                <ReadStatusIndicator isRead={true} />
                              ) : (
                                <ReadStatusIndicator isRead={false} />
                              )}
                            </div>
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
                      onClick={() => loadMessages(selectedUser.id, false)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                      title="立即同步消息"
                    >
                      🔄
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? '发送中...' : '发送'}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    按 Enter 发送 • 🔄 手动同步 • 自动检查新消息每8秒
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