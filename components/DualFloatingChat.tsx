'use client'

import { useState, useEffect, useCallback } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
} from 'stream-chat-react'
import { MessageCircle, X, Users, ChevronDown } from 'lucide-react'
import 'stream-chat-react/dist/css/v2/index.css'

interface DualFloatingChatProps {
  matchedUsers: any[]
  initialUserId?: string
}

export default function DualFloatingChat({ matchedUsers, initialUserId }: DualFloatingChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  const [channelsCreated, setChannelsCreated] = useState(false)
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [initError, setInitError] = useState<string | null>(null)

  const [isLeftMinimized, setIsLeftMinimized] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 获取当前用户信息
  useEffect(() => {
    if (!isClient) return
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user || data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
    fetchCurrentUser()
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
        return data.token as string
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

  // 获取频道列表
  const fetchUserChannels = useCallback(async () => {
    if (!chatClient || !currentUser) return
    try {
      const userChannels = await chatClient.queryChannels(
        { type: 'messaging', members: { $in: [currentUser.id.toString()] } },
        { last_message_at: -1 },
        { limit: 50 }
      )
      setChannels(userChannels)
      const totalUnread = userChannels.reduce((sum, channel) => sum + ((channel as any).count_unread || 0), 0)
      setUnreadCount(totalUnread)

      if (initialUserId && userChannels.length > 0 && !selectedChannel) {
        const targetChannel = userChannels.find((channel) => {
          const other = getOtherUser(channel)
          return other?.id === initialUserId
        })
        if (targetChannel) {
          setSelectedChannel(targetChannel)
          setIsLeftMinimized(false)
          return
        }
      }
      if (userChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(userChannels[0])
        setIsLeftMinimized(false)
      }
    } catch (error) {
      console.error('获取频道列表失败:', error)
    }
  }, [chatClient, currentUser, selectedChannel, initialUserId])

  // 获取频道中对方用户
  const getOtherUser = (channel: any) => {
    if (!currentUser || !channel.state.members) return null
    const memberIds = Object.keys(channel.state.members)
    const otherUserId = memberIds.find((id) => id !== currentUser.id.toString())
    if (otherUserId) {
      const member = (channel.state.members as any)[otherUserId]
      const matchedUser = matchedUsers.find((u) => u.id === otherUserId)
      return {
        id: otherUserId,
        name: member.user?.name || matchedUser?.name || `用户${otherUserId}`,
        image: matchedUser?.photos && matchedUser.photos.length > 0 ? matchedUser.photos[0] : member.user?.image,
        online: member.user?.online || matchedUser?.isOnline || false,
      }
    }
    return null
  }

  // 为匹配用户创建频道（如不存在）
  const createChannelsForMatchedUsers = useCallback(async () => {
    if (!chatClient || !currentUser || !matchedUsers.length || channelsCreated) return
    try {
      for (const matchedUser of matchedUsers) {
        try {
          await chatClient.upsertUser({
            id: matchedUser.id.toString(),
            name: matchedUser.name,
            image: matchedUser.photos && matchedUser.photos.length > 0 ? matchedUser.photos[0] : undefined,
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
            created_by_id: currentUser.id.toString(),
          })
          await channel.watch()
          return channel
        } catch (error) {
          console.error(`创建频道失败 ${channelId}:`, error)
          return null
        }
      })

      await Promise.all(channelPromises)
      setChannelsCreated(true)
      setTimeout(() => {
        fetchUserChannels()
      }, 800)
    } catch (error) {
      console.error('创建频道过程中出错:', error)
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, fetchUserChannels])

  useEffect(() => {
    if (chatClient && currentUser && matchedUsers.length > 0 && !channelsCreated) {
      createChannelsForMatchedUsers()
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, createChannelsForMatchedUsers])

  useEffect(() => {
    if (chatClient && currentUser) {
      fetchUserChannels()
    }
  }, [chatClient, currentUser, fetchUserChannels])

  if (!isClient || initError || !chatClient) return null

  return (
    <Chat client={chatClient}>
      {/* 右侧：用户/会话列表浮窗（点击向下箭头仅折叠列表区域，保留粉色头部） */}
      <div className="fixed bottom-6 right-4 z-50 w-[260px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold">对话</h3>
              <p className="text-pink-100 text-xs">{channels.length} 个会话</p>
            </div>
          </div>
          <button
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title={isRightCollapsed ? '展开列表' : '缩进到底部'}
          >
            <ChevronDown size={16} className={`${isRightCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'}`} />
          </button>
        </div>
        <div className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ${isRightCollapsed ? 'max-h-0 opacity-0 translate-y-2' : 'max-h-[60vh] opacity-100 translate-y-0'}`}>
          <div className="max-h-[60vh] overflow-y-auto">
            {channels.length > 0 ? (
              channels.map((channel) => {
                const otherUser = getOtherUser(channel)
                const lastMessage = (channel.state as any).last_message
                const isSelected = selectedChannel?.id === channel.id
                return (
                  <div
                    key={channel.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-pink-50 border-r-2 border-pink-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => { setSelectedChannel(channel); setIsLeftMinimized(false) }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-sm font-bold text-pink-600 overflow-hidden">
                          {otherUser?.image && otherUser.image !== '/api/placeholder/400/600' ? (
                            <img
                              src={otherUser.image}
                              alt={otherUser.name}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <span
                            className="text-sm font-bold text-pink-600"
                            style={{ display: (otherUser?.image && otherUser.image !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                          >
                            {otherUser?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        {otherUser?.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-medium text-gray-900 truncate">{otherUser?.name || '未知用户'}</p>
                          {(channel as any).count_unread > 0 && (
                            <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">{(channel as any).count_unread}</span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-gray-500 truncate">{lastMessage.text || '图片消息'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              )
            ) : (
              <div className="p-4 text-center">
                <Users size={22} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">暂无对话</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 左侧：会话内容浮窗 */}
      {isLeftMinimized ? (
        <div className="fixed bottom-6 z-50" style={{ right: 260 + 20 }}>
          <button
            onClick={() => setIsLeftMinimized(false)}
            className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            title="打开聊天窗口"
          >
            <MessageCircle size={22} />
          </button>
        </div>
      ) : (
        <div className="fixed bottom-6 z-50 w-[520px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ right: 260 + 20 }}>
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageCircle size={14} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">聊天</h3>
                <p className="text-pink-100 text-[11px]">{selectedChannel ? '对话中' : '请选择右侧会话'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLeftMinimized(true)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="最小化"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {selectedChannel ? (
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
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle size={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">从右侧选择会话开始聊天</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Chat>
  )
}


