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
import { MessageCircle, X, Users, Heart, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import 'stream-chat-react/dist/css/v2/index.css'

interface StreamChatPanelProps {
  matchedUsers: any[]
  initialUserId?: string
  isOpen: boolean
  onClose: () => void
  position?: 'left' | 'right'
}

export default function StreamChatPanel({ matchedUsers, initialUserId, isOpen, onClose, position = 'right' }: StreamChatPanelProps) {
  const [streamToken, setStreamToken] = useState<string | null>(null)
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [channelsCreated, setChannelsCreated] = useState(false)
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [initError, setInitError] = useState<string | null>(null)
  const [showChatBox, setShowChatBox] = useState(false)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 监听窗口高度变化
  useEffect(() => {
    if (!isClient) return

    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight)
    }

    updateWindowHeight()
    window.addEventListener('resize', updateWindowHeight)

    return () => {
      window.removeEventListener('resize', updateWindowHeight)
    }
  }, [isClient])

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
      if (!token) return null

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
      }
    } catch (error) {
      console.error('获取Stream token失败:', error)
    }
    return null
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
            image: currentUser.photos && currentUser.photos.length > 0 ? currentUser.photos[0] : (currentUser.avatar_url || undefined)
          },
          token
        )

        setChatClient(client)
        setInitError(null)

      } catch (error) {
        console.error('初始化Stream Chat失败:', error)
        setInitError('聊天服务连接失败')
      }
    }

    initStreamChat()

    return () => {
      if (chatClient) {
        chatClient.disconnectUser()
      }
    }
  }, [currentUser, isClient, chatClient])

  // 获取用户频道列表
  const fetchUserChannels = useCallback(async () => {
    if (!chatClient || !currentUser) return

    try {
      const filter = { members: { $in: [currentUser.id.toString()] } }
      const sort = [{ last_message_at: -1 }]
      
      const userChannels = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      })

      setChannels(userChannels)
      
      // 计算未读消息总数
      const totalUnread = userChannels.reduce((sum, channel) => sum + ((channel as any).count_unread || 0), 0)
      setUnreadCount(totalUnread)
      
      // 如果有初始用户ID，尝试找到对应的频道
      if (initialUserId && userChannels.length > 0 && !selectedChannel) {
        const targetChannel = userChannels.find(channel => {
          const otherUser = getOtherUser(channel)
          return otherUser?.id === initialUserId
        })
        
        if (targetChannel) {
          console.log('🎯 找到初始用户频道:', targetChannel.id)
          setSelectedChannel(targetChannel)
          setShowChatBox(true)
          return
        }
      }
      
      // 否则选择第一个频道
      if (userChannels.length > 0 && !selectedChannel) {
        console.log('📌 选择第一个频道:', userChannels[0].id)
        setSelectedChannel(userChannels[0])
      }
    } catch (error) {
      console.error('❌ 获取频道列表失败:', error)
    }
  }, [chatClient, currentUser, selectedChannel, initialUserId])

  // 获取频道中的其他用户
  const getOtherUser = (channel: any) => {
    if (!currentUser || !channel.state.members) return null
    
    const memberIds = Object.keys(channel.state.members)
    const otherUserId = memberIds.find(id => id !== currentUser.id.toString())
    
    if (otherUserId) {
      const member = (channel.state.members as any)[otherUserId]
      
      // 从matchedUsers中查找对应的用户数据
      const matchedUser = matchedUsers.find(user => user.id === otherUserId)
      
      const avatarUrl = matchedUser?.photos && matchedUser.photos.length > 0 ? matchedUser.photos[0] : matchedUser?.avatar_url
      
      return {
        id: otherUserId,
        name: member.user?.name || matchedUser?.name || `用户${otherUserId}`,
        image: undefined,
        avatarUrl: avatarUrl,
        online: member.user?.online || matchedUser?.isOnline || false
      }
    }
    return null
  }

  // 获取频道中其他用户的个人简介
  const getOtherUserBio = (channel: any) => {
    if (!currentUser || !channel.state.members) return null
    
    const memberIds = Object.keys(channel.state.members)
    const otherUserId = memberIds.find(id => id !== currentUser.id.toString())
    
    if (otherUserId) {
      const matchedUser = matchedUsers.find(user => user.id === otherUserId)
      
      if (matchedUser) {
        if (matchedUser.bio && matchedUser.bio.trim()) {
          return matchedUser.bio
        }
        if (matchedUser.occupation && matchedUser.occupation.trim()) {
          return matchedUser.occupation
        }
        if (matchedUser.location && matchedUser.location.trim() && matchedUser.location !== '未知') {
          return `${matchedUser.location}`
        }
      }
    }
    return null
  }

  // 为匹配的用户创建频道
  const createChannelsForMatchedUsers = useCallback(async () => {
    if (!chatClient || !currentUser || !matchedUsers.length || channelsCreated) return

    try {
      // 首先为所有匹配的用户设置用户信息
      for (const matchedUser of matchedUsers) {
        try {
          await chatClient.upsertUser({
            id: matchedUser.id.toString(),
            name: matchedUser.name,
            image: undefined
          })
        } catch (error) {
          console.error(`设置用户信息失败 ${matchedUser.id}:`, error)
        }
      }

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
      console.error('❌ 创建频道失败:', error)
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, fetchUserChannels])

  // 当聊天客户端准备好时，创建频道
  useEffect(() => {
    if (chatClient && currentUser && matchedUsers.length > 0 && !channelsCreated) {
      createChannelsForMatchedUsers()
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, createChannelsForMatchedUsers])

  // 处理用户头像点击
  const handleUserAvatarClick = (channel: any) => {
    console.log('🎯 点击用户头像，选择频道:', channel.id)
    setSelectedChannel(channel)
    if (position === 'right') {
      setShowChatBox(true)
    }
  }

  // 关闭聊天框
  const handleCloseChatBox = () => {
    setShowChatBox(false)
    setSelectedChannel(null)
  }

  // 服务器端渲染时返回null
  if (!isClient) {
    return null
  }

  // 如果有错误，不显示聊天窗口
  if (initError) {
    return null
  }

  // 如果聊天客户端未初始化，不显示聊天窗口
  if (!chatClient) {
    return null
  }

  // 左侧布局
  if (position === 'left') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
        <div className="w-full max-w-md bg-white shadow-xl flex flex-col">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle size={18} />
                <div className="text-sm font-medium">我的匹配</div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 聊天内容区域 */}
          <div className="flex-1 flex flex-col min-h-0">
            {chatClient && selectedChannel ? (
              <Chat client={chatClient}>
                <Channel channel={selectedChannel}>
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-hidden">
                      <MessageList />
                    </div>
                    <div className="flex-shrink-0">
                      <MessageInput />
                    </div>
                  </div>
                  <Thread />
                </Channel>
              </Chat>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>正在加载聊天...</p>
                  <p className="text-sm mt-1">
                    {!chatClient ? '聊天客户端未连接' : '频道未选择'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 用户列表 */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="text-sm font-medium text-gray-700 mb-3">匹配用户</div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {channels.length > 0 ? (
                channels.map((channel) => {
                  const otherUser = getOtherUser(channel)
                  const unreadCount = (channel as any).count_unread || 0
                  
                  return (
                    <div
                      key={channel.id}
                      className={`cursor-pointer p-2 rounded-lg transition-colors ${
                        selectedChannel?.id === channel.id ? 'bg-pink-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserAvatarClick(channel)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-600 overflow-hidden">
                            {otherUser?.avatarUrl ? (
                              <img 
                                src={otherUser.avatarUrl} 
                                alt={otherUser.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span>{otherUser?.name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser?.name || '未知用户'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 text-sm">暂无匹配</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 右侧布局
  return (
    <>
      {/* 右侧面板 */}
      <div className="fixed bottom-0 right-0 w-80 bg-white shadow-lg border-l border-gray-200 z-40 flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle size={18} />
              <div className="text-sm font-medium">我的匹配</div>
            </div>
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              {isPanelCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* 用户列表 */}
        <div className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${isPanelCollapsed ? 'hidden' : 'block'}`}>
          {channels.length > 0 ? (
            <div className="space-y-4">
              {channels.map((channel) => {
                const otherUser = getOtherUser(channel)
                const unreadCount = (channel as any).count_unread || 0
                
                return (
                  <div
                    key={channel.id}
                    className="cursor-pointer group"
                    onClick={() => handleUserAvatarClick(channel)}
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-sm font-bold text-pink-600 overflow-hidden border-2 border-transparent group-hover:border-pink-300 transition-colors">
                          {otherUser?.avatarUrl ? (
                            <img 
                              src={otherUser.avatarUrl} 
                              alt={otherUser.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span>{otherUser?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        
                        {/* 在线状态指示器 */}
                        {otherUser?.online && (
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                        
                        {/* 未读消息指示器 */}
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                      
                      {/* 用户名字和简介 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          {otherUser?.name || '未知用户'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {getOtherUserBio(channel) || '这个人很神秘...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-2 text-center">
              <Users size={16} className="text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">暂无匹配</p>
            </div>
          )}
        </div>
      </div>

      {/* 右侧聊天框 */}
      {showChatBox && selectedChannel && (
        <div className="fixed bottom-0 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col" style={{ right: 336 + 20 }}>
          {/* 聊天框头部 */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageCircle size={14} />
              </div>
              <span className="text-base font-medium">
                {getOtherUser(selectedChannel)?.name || '聊天'}
              </span>
            </div>
            <button
              onClick={handleCloseChatBox}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 聊天内容 */}
          <div className="flex-1 flex flex-col min-h-0">
            {chatClient && selectedChannel ? (
              <Chat client={chatClient}>
                <Channel channel={selectedChannel}>
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-hidden">
                      <MessageList />
                    </div>
                    <div className="flex-shrink-0">
                      <MessageInput />
                    </div>
                  </div>
                  <Thread />
                </Channel>
              </Chat>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>正在加载聊天...</p>
                  <p className="text-sm mt-1">
                    {!chatClient ? '聊天客户端未连接' : '频道未选择'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
} 