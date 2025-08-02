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
import { MessageCircle, X, Minimize2, Maximize2, Users } from 'lucide-react'
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
    height: 100% !important;
    overflow-y: auto !important;
  }
  
  .str-chat__message-list-scroll {
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
  }
  
  .str-chat__input-flat {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .str-chat__input-flat--textarea {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .str-chat__channel {
    height: 100% !important;
  }
  
  .str-chat__channel-messaging {
    height: 100% !important;
  }
  
  .str-chat__channel-messaging__main-panel {
    height: 100% !important;
  }
  
  .str-chat__channel-messaging__main-panel-inner {
    height: 100% !important;
  }
  
  .str-chat__channel-messaging__main-panel-inner .str-chat__message-list {
    height: calc(100% - 120px) !important;
  }
  
  .str-chat__message {
    margin-bottom: 8px !important;
  }
  
  .str-chat__message--received {
    margin-left: 8px !important;
  }
  
  .str-chat__message--sent {
    margin-right: 8px !important;
  }
  
  .str-chat__message-bubble--received {
    background-color: #f3f4f6 !important;
    color: #374151 !important;
  }
  
  .str-chat__message-bubble--sent {
    background-color: #ec4899 !important;
    color: white !important;
  }
  
  .str-chat__message-input {
    border-top: 1px solid #e5e7eb !important;
    padding: 12px !important;
  }
  
  .str-chat__channel-header {
    border-bottom: 1px solid #e5e7eb !important;
    padding: 12px !important;
  }
`

interface FloatingChatProps {
  matchedUsers: any[]
  initialUserId?: string
}

export default function FloatingChat({ matchedUsers, initialUserId }: FloatingChatProps) {
  const [streamToken, setStreamToken] = useState<string | null>(null)
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [channelsCreated, setChannelsCreated] = useState(false)
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [initError, setInitError] = useState<string | null>(null)

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
            image: currentUser.avatar_url || undefined
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
      console.log('🔄 开始获取用户频道列表...')
      const userChannels = await chatClient.queryChannels(
        {
          type: 'messaging',
          members: { $in: [currentUser.id.toString()] }
        },
        { last_message_at: -1 },
        { limit: 50 }
      )
      
      console.log(`✅ 获取到 ${userChannels.length} 个频道`)
      console.log('📋 频道详情:', userChannels.map(ch => ({
        id: ch.id,
        memberCount: Object.keys(ch.state.members || {}).length,
        lastMessage: (ch.state as any).last_message?.text || '无消息',
        unreadCount: ch.count_unread || 0
      })))
      
      setChannels(userChannels)
      
      // 计算未读消息总数
      const totalUnread = userChannels.reduce((sum, channel) => sum + (channel.count_unread || 0), 0)
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
          setIsMinimized(false)
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
  }, [chatClient, currentUser, selectedChannel, initialUserId, getOtherUser])

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* 浮动聊天按钮 */}
      {isMinimized && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 聊天窗口 */}
      {!isMinimized && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            isExpanded ? 'w-[600px] h-[700px]' : 'w-[500px] h-[600px]'
          }`}>
            {/* 聊天头部 */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">聊天</h3>
                    <p className="text-pink-100 text-xs">
                      {matchedUsers.length} 个匹配
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 聊天内容 */}
            <div className="flex-1 flex flex-col" style={{ height: 'calc(100% - 80px)' }}>
              <Chat client={chatClient}>
                <div className="flex w-full h-full">
                  {/* 频道列表 */}
                  <div className="w-2/5 border-r border-gray-200 bg-gray-50 flex flex-col">
                    <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
                      <h4 className="text-sm font-semibold text-gray-900">对话</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {channels.length > 0 ? (
                        channels.map((channel) => {
                          const otherUser = getOtherUser(channel)
                          const lastMessage = (channel.state as any).last_message
                          const isSelected = selectedChannel?.id === channel.id
                          
                          return (
                            <div
                              key={channel.id}
                              className={`p-3 cursor-pointer transition-colors ${
                                isSelected ? 'bg-pink-50 border-r-2 border-pink-500' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => setSelectedChannel(channel)}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-600">
                                    {otherUser?.image ? (
                                      <img 
                                        src={otherUser.image} 
                                        alt={otherUser.name}
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      otherUser?.name?.charAt(0) || '?'
                                    )}
                                  </div>
                                  {otherUser?.online && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {otherUser?.name || '未知用户'}
                                    </p>
                                    {channel.count_unread > 0 && (
                                      <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {channel.count_unread}
                                      </span>
                                    )}
                                  </div>
                                  {lastMessage && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {lastMessage.text || '图片消息'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-4 text-center">
                          <Users size={24} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">暂无对话</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 聊天窗口 */}
                  <div className="flex-1 flex flex-col min-h-0">
                    {selectedChannel ? (
                      <Channel channel={selectedChannel}>
                        <Window>
                          <ChannelHeader />
                          <div className="flex-1 overflow-hidden">
                            <MessageList />
                          </div>
                          <MessageInput />
                        </Window>
                        <Thread />
                      </Channel>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageCircle size={32} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">选择对话开始聊天</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Chat>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 