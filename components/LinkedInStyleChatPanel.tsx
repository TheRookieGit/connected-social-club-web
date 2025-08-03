'use client'

import { useState, useEffect, useCallback } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
import { Pin, Trash2, MoreVertical, MapPin, Clock, MessageCircle, X, Minimize2, Maximize2, Search } from 'lucide-react'
import 'stream-chat-react/dist/css/v2/index.css'

// 自定义样式覆盖
const customStyles = `
  .str-chat__message-bubble {
    max-width: 100% !important;
    word-wrap: break-word !important;
  }
  
  .str-chat__message-text {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  
  .str-chat__message-list {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .str-chat__message-list-scroll {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .str-chat__input-flat {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .str-chat__input-flat--textarea {
    width: 100% !important;
    max-width: 100% !important;
  }
`

interface LinkedInStyleChatPanelProps {
  matchedUsers: any[]
  onClose: () => void
  initialUserId?: string
  isOpen?: boolean
  position?: 'left' | 'right' | 'bottom-right'
}

export default function LinkedInStyleChatPanel({ 
  matchedUsers, 
  onClose,
  initialUserId,
  isOpen = true,
  position = 'bottom-right'
}: LinkedInStyleChatPanelProps) {
  const [streamToken, setStreamToken] = useState<string | null>(null)
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [channelsCreated, setChannelsCreated] = useState(false)
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [showChannelMenu, setShowChannelMenu] = useState<string | null>(null)
  const [pinnedChannels, setPinnedChannels] = useState<Set<string>>(new Set())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showRetryButton, setShowRetryButton] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  // 自动清除错误信息
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
        setShowRetryButton(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 获取当前用户信息
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
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    if (isClient) {
      fetchCurrentUser()
    }
  }, [isClient])

  // 获取Stream Chat令牌
  const fetchStreamToken = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setInitError('请先登录')
        return null
      }
      
      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStreamToken(data.token)
        return data.token
      } else {
        setInitError('无法获取聊天令牌')
        return null
      }
    } catch (error) {
      setInitError('网络错误，请重试')
      return null
    }
  }

  // 初始化Stream Chat客户端
  useEffect(() => {
    const initStreamChat = async () => {
      if (!currentUser || !isClient) return

      try {
        const token = await fetchStreamToken()
        if (!token) return

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
        if (!apiKey) {
          setInitError('Stream Chat API密钥未配置')
          return
        }
        
        const client = StreamChat.getInstance(apiKey)
        
        await client.connectUser(
          {
            id: currentUser.id.toString(),
            name: currentUser.name,
            image: currentUser.avatar_url || undefined
          },
          token
        )

        setChatClient(client)
        setInitError(null)

      } catch (error) {
        setInitError('聊天服务连接失败')
      }
    }

    initStreamChat()

    return () => {
      if (chatClient) {
        chatClient.disconnectUser()
      }
    }
  }, [currentUser, isClient])

  // 获取用户的所有频道
  const fetchUserChannels = useCallback(async () => {
    if (!chatClient || !currentUser) return

    try {
      const userChannels = await chatClient.queryChannels(
        {
          type: 'messaging',
          members: { $in: [currentUser.id.toString()] }
        },
        { last_message_at: -1 },
        { limit: 50 }
      )
      
      setChannels(userChannels)
      
      if (userChannels.length > 0 && !selectedChannel) {
        if (initialUserId) {
          const targetChannel = userChannels.find(channel => {
            const otherUser = getOtherUser(channel)
            return otherUser?.id === initialUserId
          })
          
          if (targetChannel) {
            setSelectedChannel(targetChannel)
            return
          }
        }
        setSelectedChannel(userChannels[0])
      }
    } catch (error) {
      console.error('获取频道列表失败:', error)
      setChannels([])
      setErrorMessage('获取聊天列表失败')
      setShowRetryButton(true)
    }
  }, [chatClient, currentUser, selectedChannel, initialUserId])

  // 重试获取频道列表
  const retryFetchChannels = useCallback(() => {
    setErrorMessage(null)
    setShowRetryButton(false)
    fetchUserChannels()
  }, [fetchUserChannels])

  // 为匹配的用户创建频道
  const createChannelsForMatchedUsers = useCallback(async () => {
    if (!chatClient || !currentUser || !matchedUsers.length || channelsCreated) return

    try {
      const channelPromises = matchedUsers.map(async (matchedUser) => {
        const channelId = `chat-${Math.min(currentUser.id, matchedUser.id)}-${Math.max(currentUser.id, matchedUser.id)}`
        
        try {
          const channel = chatClient.channel('messaging', channelId, {
            members: [currentUser.id.toString(), matchedUser.id.toString()],
            created_by_id: currentUser.id.toString()
          })

          await channel.watch()
          return channel
        } catch (error) {
          console.error(`创建频道失败 ${channelId}:`, error)
          return null
        }
      })
      
      const createdChannels = await Promise.all(channelPromises)
      const successfulChannels = createdChannels.filter(Boolean)
      
      setChannelsCreated(true)
      
      setTimeout(() => {
        fetchUserChannels()
      }, 1000)
      
    } catch (error) {
      console.error('创建频道过程中出错:', error)
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, fetchUserChannels])

  // 当客户端和匹配用户都准备好时创建频道
  useEffect(() => {
    if (chatClient && currentUser && matchedUsers.length > 0 && !channelsCreated) {
      createChannelsForMatchedUsers()
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, createChannelsForMatchedUsers])

  // 获取用户频道列表
  useEffect(() => {
    if (chatClient && currentUser) {
      fetchUserChannels()
    }
  }, [chatClient, currentUser, fetchUserChannels])

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

  // 获取频道中的其他用户
  const getOtherUser = (channel: any) => {
    if (!currentUser || !channel.state.members) return null
    
    const memberIds = Object.keys(channel.state.members)
    const otherUserId = memberIds.find(id => id !== currentUser.id.toString())
    
    if (otherUserId) {
      const member = (channel.state.members as any)[otherUserId]
      return {
        id: otherUserId,
        name: member.user?.name || `用户${otherUserId}`,
        image: member.user?.image,
        online: member.user?.online || false
      }
    }
    return null
  }

  // 置顶频道
  const togglePinChannel = (channelId: string) => {
    setPinnedChannels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(channelId)) {
        newSet.delete(channelId)
      } else {
        newSet.add(channelId)
      }
      return newSet
    })
    setShowChannelMenu(null)
  }

  // 删除频道
  const deleteChannel = async (channel: any) => {
    if (!chatClient || !currentUser) return

    try {
      await channel.delete()
      setChannels(prev => prev.filter(c => c.id !== channel.id))
      
      if (selectedChannel?.id === channel.id) {
        setSelectedChannel(null)
      }
      
      setPinnedChannels(prev => {
        const newSet = new Set(prev)
        newSet.delete(channel.id)
        return newSet
      })
    } catch (error) {
      console.error('删除频道失败:', error)
      alert('删除频道失败，请重试')
    }
    
    setShowChannelMenu(null)
  }

  // 获取排序后的频道列表（置顶的在前）
  const getSortedChannels = () => {
    return [...channels].sort((a, b) => {
      const aPinned = pinnedChannels.has(a.id)
      const bPinned = pinnedChannels.has(b.id)
      
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
      
      const aTime = (a.state as any).last_message?.created_at || 0
      const bTime = (b.state as any).last_message?.created_at || 0
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  }

  // 搜索用户
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setSearchResults([])
        return
      }

      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.users)
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.trim()) {
      searchUsers(value)
    } else {
      setSearchResults([])
    }
  }

  // 创建与用户的聊天频道
  const createChatWithUser = async (userId: string, userName: string) => {
    if (!chatClient || !currentUser) {
      setErrorMessage('聊天服务未初始化')
      return
    }

    try {
      const existingChannels = await chatClient.queryChannels({
        type: 'messaging',
        members: { $in: [currentUser.id.toString()] },
        $and: [
          { members: { $in: [userId] } }
        ]
      }, {}, { limit: 10 })

      if (existingChannels.length > 0) {
        setSelectedChannel(existingChannels[0])
        setSearchTerm('')
        setSearchResults([])
        return
      }

      const channelId = `messaging-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const channel = chatClient.channel('messaging', channelId, {
        members: [currentUser.id.toString(), userId],
        created_by_id: currentUser.id.toString()
      })

      await channel.watch()
      
      setChannels(prev => [channel, ...prev])
      setSelectedChannel(channel)
      setSearchTerm('')
      setSearchResults([])
      
    } catch (error) {
      console.error('创建聊天频道失败:', error)
      setErrorMessage('创建聊天频道失败')
    }
  }

  // 显示错误状态
  if (initError) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-xs">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">聊天服务暂时不可用</h3>
            <p className="text-xs text-gray-600 mb-4">{initError}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setInitError(null)
                  window.location.reload()
                }}
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 服务器端渲染时返回null
  if (!isClient) {
    return null
  }

  // 显示加载状态
  if (!chatClient) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">正在连接聊天服务...</h3>
            <p className="text-xs text-gray-600">首次连接可能需要几秒钟</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果最小化，只显示聊天图标
  if (isMinimized) {
    const positionClasses = {
      'left': 'fixed bottom-4 left-4',
      'right': 'fixed bottom-4 right-4',
      'bottom-right': 'fixed bottom-4 right-4'
    }
    
    return (
      <div className={`${positionClasses[position]} z-50`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    )
  }

  // 根据position属性决定显示位置和样式
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'fixed left-4 top-1/2 transform -translate-y-1/2'
      case 'right':
        return 'fixed right-4 top-1/2 transform -translate-y-1/2'
      case 'bottom-right':
      default:
        return 'fixed bottom-4 right-4'
    }
  }

  return (
    <div className={`${getPositionClasses()} z-50`}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* 聊天浮窗 */}
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[500px]'
      }`}>
        
        {/* 头部 */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} />
            <span className="font-semibold">消息</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <Minimize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索消息"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-200">
          <button className="flex-1 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            专注
          </button>
          <button className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            其他
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex h-[calc(100%-120px)]">
          {/* 左侧：对话列表 */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {channels.length > 0 ? (
              <div className="space-y-1">
                {getSortedChannels().map((channel) => {
                  const otherUser = getOtherUser(channel)
                  const lastMessage = (channel.state as any).last_message
                  const isSelected = selectedChannel?.id === channel.id
                  const isPinned = pinnedChannels.has(channel.id)
                  
                  return (
                    <div
                      key={channel.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-r-2 border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedChannel(channel)}
                    >
                      <div className="flex items-center space-x-3">
                        {/* 头像 */}
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {otherUser?.image ? (
                              <img 
                                src={otherUser.image} 
                                alt={otherUser.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {otherUser?.name?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          {otherUser?.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* 用户信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {otherUser?.name || '未知用户'}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {lastMessage ? formatTime(new Date((lastMessage as any).created_at)) : ''}
                            </span>
                          </div>
                          
                          {/* 最后消息 */}
                          {lastMessage && (
                            <p className="text-xs text-gray-600 truncate">
                              {(lastMessage as any).user?.id === currentUser?.id ? '你: ' : ''}
                              {lastMessage.text || '图片消息'}
                            </p>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowChannelMenu(showChannelMenu === channel.id ? null : channel.id)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical size={14} />
                          </button>
                          
                          {showChannelMenu === channel.id && (
                            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  togglePinChannel(channel.id)
                                }}
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center space-x-2 ${
                                  isPinned ? 'text-blue-600' : 'text-gray-700'
                                }`}
                              >
                                <Pin size={12} />
                                <span>{isPinned ? '取消置顶' : '置顶'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm('确定要删除这个对话吗？')) {
                                    deleteChannel(channel)
                                  }
                                }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-600 flex items-center space-x-2"
                              >
                                <Trash2 size={12} />
                                <span>删除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center">
                <MessageCircle size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">暂无对话</p>
              </div>
            )}
          </div>

          {/* 右侧：用户列表或聊天窗口 */}
          <div className="w-1/2">
            {selectedChannel ? (
              <div className="h-full flex flex-col">
                <Chat client={chatClient}>
                  <Channel channel={selectedChannel}>
                    <Window>
                      <ChannelHeader />
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="h-full overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">搜索结果</h4>
                </div>
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        user.canStartChat 
                          ? 'hover:bg-gray-50' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (user.canStartChat) {
                          createChatWithUser(user.id.toString(), user.name || user.id)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {(user.name || user.id).charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {user.name || `用户${user.id}`}
                            </h4>
                            {user.isMatched && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                                已匹配
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {user.canStartChat ? '点击开始聊天' : '需要先匹配'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-4">
                  <MessageCircle size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? '搜索用户开始对话' : '选择对话或搜索用户'}
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