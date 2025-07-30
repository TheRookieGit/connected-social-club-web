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
import { Pin, Trash2, MoreVertical, MapPin, Clock } from 'lucide-react'
import 'stream-chat-react/dist/css/v2/index.css'

interface StreamChatPanelProps {
  matchedUsers: any[]  // 改为接受匹配用户列表
  onClose: () => void
}

export default function StreamChatPanel({ 
  matchedUsers, 
  onClose
}: StreamChatPanelProps) {
  const [streamToken, setStreamToken] = useState<string | null>(null)
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [channelsCreated, setChannelsCreated] = useState(false)
  const [forceRefresh, setForceRefresh] = useState(0) // 用于强制刷新ChannelList
  const [initError, setInitError] = useState<string | null>(null)
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [showChannelMenu, setShowChannelMenu] = useState<string | null>(null)
  const [pinnedChannels, setPinnedChannels] = useState<Set<string>>(new Set())

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
          console.log('✅ 当前用户信息:', userData)
        }
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
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
        console.error('❌ 本地存储中没有token')
        setInitError('请先登录')
        return null
      }

      console.log('🔑 开始获取Stream Chat token...')
      
      const response = await fetch('/api/stream/token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Stream token响应:', data)
        setStreamToken(data.token)
        return data.token
      } else {
        console.error('❌ Stream token请求失败:', response.status, response.statusText)
        setInitError('无法获取聊天令牌')
        return null
      }
    } catch (error) {
      console.error('❌ 获取Stream token失败:', error)
      setInitError('网络错误，请重试')
      return null
    }
  }

  // 初始化Stream Chat客户端
  useEffect(() => {
    const initStreamChat = async () => {
      if (!currentUser || !isClient) {
        console.log('⏳ 等待用户数据或客户端初始化...', { currentUser: !!currentUser, isClient })
        return
      }

      try {
        console.log('🔄 开始初始化Stream Chat客户端...')
        const token = await fetchStreamToken()
        if (!token) {
          console.error('❌ 无法获取Stream Chat token')
          return
        }

        console.log('🔑 获得Stream Chat token，开始连接...')
        
        // 检查环境变量
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
        if (!apiKey) {
          console.error('❌ NEXT_PUBLIC_STREAM_API_KEY 环境变量未设置')
          setInitError('Stream Chat API密钥未配置，请联系管理员')
          return
        }
        
        console.log('🔧 使用API Key创建Stream客户端...', { apiKey: apiKey.substring(0, 8) + '...' })
        const client = StreamChat.getInstance(apiKey)
        
        // 连接用户
        const connectResult = await client.connectUser(
          {
            id: currentUser.id.toString(),
            name: currentUser.name,
            image: currentUser.avatar_url || undefined
          },
          token
        )

        console.log('✅ Stream Chat客户端连接成功!', connectResult)
        console.log('👤 连接的用户信息:', {
          id: currentUser.id.toString(),
          name: currentUser.name,
          image: currentUser.avatar_url
        })
        
        setChatClient(client)
        setInitError(null) // 清除错误状态

      } catch (error) {
        console.error('❌ 初始化Stream Chat失败:', error)
        setInitError('聊天服务连接失败，请重试')
      }
    }

    initStreamChat()

    // 清理函数
    return () => {
      if (chatClient) {
        console.log('🧹 清理Stream Chat连接...')
        chatClient.disconnectUser()
      }
    }
  }, [currentUser, isClient, chatClient])

  // 获取用户的所有频道
  const fetchUserChannels = useCallback(async () => {
    if (!chatClient || !currentUser) return

    try {
      console.log('📡 获取用户频道列表...')
      const userChannels = await chatClient.queryChannels({
        type: 'messaging',
        members: { $in: [currentUser.id.toString()] }
      })
      
      console.log(`✅ 获取到 ${userChannels.length} 个频道`)
      setChannels(userChannels)
      
      // 如果有频道且没有选中的频道，选择第一个
      if (userChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(userChannels[0])
      }
    } catch (error) {
      console.error('❌ 获取频道列表失败:', error)
    }
  }, [chatClient, currentUser, selectedChannel])

  // 为匹配的用户创建频道
  const createChannelsForMatchedUsers = useCallback(async () => {
    if (!chatClient || !currentUser || !matchedUsers.length || channelsCreated) return

    try {
      console.log('🚀 开始为匹配用户创建频道...')
      console.log('📋 当前用户:', currentUser)
      console.log('👥 匹配用户列表:', matchedUsers)
      
      const channelPromises = matchedUsers.map(async (matchedUser) => {
        // 使用标准化的频道ID格式
        const channelId = `chat-${Math.min(currentUser.id, matchedUser.id)}-${Math.max(currentUser.id, matchedUser.id)}`
        
        try {
          console.log(`🔧 创建频道: ${channelId}，参与者: [${currentUser.id}, ${matchedUser.id}]`)
          
          // 创建或获取频道
          const channel = chatClient.channel('messaging', channelId, {
            members: [currentUser.id.toString(), matchedUser.id.toString()],
            created_by_id: currentUser.id.toString()
          })

          await channel.watch()
          console.log(`✅ 频道创建成功: ${channelId}`)
          
          return channel
        } catch (error) {
          console.error(`❌ 创建频道失败 ${channelId}:`, error)
          return null
        }
      })
      
      // 等待所有频道创建完成
      const createdChannels = await Promise.all(channelPromises)
      const successfulChannels = createdChannels.filter(Boolean)
      
      console.log(`🎉 成功创建 ${successfulChannels.length}/${matchedUsers.length} 个频道`)
      setChannelsCreated(true)
      
      // 创建完成后刷新频道列表
      setTimeout(() => {
        fetchUserChannels()
      }, 1000)
      
    } catch (error) {
      console.error('💥 创建频道过程中出错:', error)
    }
  }, [chatClient, currentUser, matchedUsers, channelsCreated, fetchUserChannels])

  // 当客户端和匹配用户都准备好时创建频道
  useEffect(() => {
    console.log('📋 检查频道创建条件:', {
      chatClient: !!chatClient,
      currentUser: !!currentUser,
      matchedUsersLength: matchedUsers.length,
      channelsCreated
    })
    
    if (chatClient && currentUser && matchedUsers.length > 0 && !channelsCreated) {
      console.log('✅ 条件满足，开始创建频道...')
      createChannelsForMatchedUsers()
    } else if (matchedUsers.length === 0) {
      console.log('💭 没有匹配用户，跳过频道创建')
    } else {
      console.log('⏳ 频道创建条件未满足')
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
      const member = channel.state.members[otherUserId]
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
      console.log(`🗑️ 删除频道: ${channel.id}`)
      
      // 从Stream Chat中删除频道
      await channel.delete()
      
      // 从本地状态中移除频道
      setChannels(prev => prev.filter(c => c.id !== channel.id))
      
      // 如果删除的是当前选中的频道，清除选中状态
      if (selectedChannel?.id === channel.id) {
        setSelectedChannel(null)
      }
      
      // 从置顶列表中移除
      setPinnedChannels(prev => {
        const newSet = new Set(prev)
        newSet.delete(channel.id)
        return newSet
      })
      
      console.log(`✅ 频道删除成功: ${channel.id}`)
    } catch (error) {
      console.error(`❌ 删除频道失败: ${channel.id}`, error)
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
      
      // 如果置顶状态相同，按最后消息时间排序
      const aTime = a.state.last_message?.created_at || 0
      const bTime = b.state.last_message?.created_at || 0
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  }

  // 服务器端渲染时返回加载状态
  if (!isClient) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">加载聊天中...</h3>
            <p className="text-gray-600 text-sm">正在初始化聊天服务</p>
          </div>
        </div>
      </div>
    )
  }

  // 显示错误状态
  if (initError) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">聊天服务暂时不可用</h3>
            <p className="text-gray-600 mb-6">{initError}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setInitError(null)
                  window.location.reload()
                }}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium"
              >
                重试
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!chatClient) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">正在连接专业聊天服务...</h3>
            <p className="text-gray-600 text-sm">首次连接可能需要几秒钟</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-pink-100">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">甜蜜聊天</h2>
              <p className="text-pink-100 text-sm">
                {matchedUsers.length} 个匹配 • 专业聊天服务
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 聊天内容 */}
        <div className="flex-1 flex">
          <Chat client={chatClient}>
            <div className="flex w-full h-full">
              {/* 频道列表 */}
              <div className="w-1/3 border-r border-pink-200 bg-gradient-to-b from-pink-50 to-rose-50">
                <div className="p-6 border-b border-pink-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">已匹配用户</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {matchedUsers.length > 0 ? '点击开始甜蜜对话' : '暂无匹配用户'}
                      </p>
                      {/* 状态信息 - 已隐藏，保留代码以备后用 */}
                      {/* <div className="mt-3 p-3 bg-pink-50 rounded-lg text-xs text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                          <span>用户ID: {currentUser?.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                          <span>匹配数: {matchedUsers.length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${channelsCreated ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                          <span>频道状态: {channelsCreated ? '✅ 已创建' : '⏳ 创建中'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${chatClient ? 'bg-green-400' : 'bg-red-400'}`}></span>
                          <span>客户端: {chatClient ? '✅ 已连接' : '❌ 未连接'}</span>
                        </div>
                      </div> */}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          console.log('🔄 手动刷新频道列表')
                          setForceRefresh(prev => prev + 1)
                        }}
                        className="px-3 py-2 text-sm bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors font-medium"
                        title="刷新聊天列表"
                      >
                        🔄 刷新
                      </button>
                      <button
                        onClick={() => {
                          console.log('🛠️ 重新创建频道')
                          setChannelsCreated(false)
                        }}
                        className="px-3 py-2 text-sm bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors font-medium"
                        title="重新创建频道"
                      >
                        🛠️ 重新创建
                      </button>
                      <button
                        onClick={async () => {
                          console.log('🔍 查询当前用户的所有频道')
                          if (chatClient && currentUser) {
                            try {
                              const channels = await chatClient.queryChannels({
                                type: 'messaging',
                                members: { $in: [currentUser.id.toString()] }
                              })
                              console.log('📊 查询结果:', {
                                count: channels.length,
                                channels: channels.map(c => ({
                                  id: c.id,
                                  members: Object.keys(c.state.members || {}),
                                  memberCount: Object.keys(c.state.members || {}).length
                                }))
                              })
                              alert(`找到 ${channels.length} 个频道`)
                            } catch (error) {
                              console.error('❌ 查询频道失败:', error)
                              alert('查询失败: ' + error)
                            }
                          }
                        }}
                        className="px-3 py-2 text-sm bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                        title="查询频道"
                      >
                        🔍 查询
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 自定义频道列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {channels.length > 0 ? (
                    getSortedChannels().map((channel) => {
                      const otherUser = getOtherUser(channel)
                      const lastMessage = channel.state.last_message
                      const isSelected = selectedChannel?.id === channel.id
                      const isPinned = pinnedChannels.has(channel.id)
                      
                      return (
                        <div
                          key={channel.id}
                          className={`relative group cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                              : 'bg-white hover:bg-pink-50 border border-pink-100 hover:border-pink-200'
                          } rounded-2xl p-4`}
                          onClick={() => setSelectedChannel(channel)}
                        >
                          {/* 置顶标识 */}
                          {isPinned && (
                            <div className="absolute top-2 right-2 z-10">
                              <Pin size={12} className="text-pink-500" />
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            {/* 头像 */}
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                isSelected
                                  ? 'bg-white text-pink-500'
                                  : 'bg-gradient-to-br from-pink-200 to-rose-200 text-pink-600'
                              }`}>
                                {otherUser?.name?.charAt(0) || '?'}
                              </div>
                              {otherUser?.online && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>

                            {/* 用户信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-semibold truncate ${
                                  isSelected ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {otherUser?.name || '未知用户'}
                                </h4>
                                <span className={`text-xs ${
                                  isSelected ? 'text-pink-100' : 'text-gray-500'
                                }`}>
                                  {lastMessage ? formatTime(new Date(lastMessage.created_at)) : ''}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock size={12} className={isSelected ? 'text-pink-200' : 'text-gray-400'} />
                                <span className={`text-xs truncate ${
                                  isSelected ? 'text-pink-200' : 'text-gray-500'
                                }`}>
                                  频道ID: {channel.id}
                                </span>
                              </div>

                              {/* 最后消息 */}
                              {lastMessage && (
                                <p className={`text-sm truncate ${
                                  isSelected ? 'text-pink-100' : 'text-gray-600'
                                }`}>
                                  {lastMessage.user?.id === currentUser?.id ? '你: ' : ''}
                                  {lastMessage.text || '图片消息'}
                                </p>
                              )}
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex flex-col items-end space-y-2">
                              {/* 未读消息数 */}
                              {channel.count_unread > 0 && (
                                <div className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                  {channel.count_unread}
                                </div>
                              )}
                              
                              {/* 操作菜单 */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowChannelMenu(showChannelMenu === channel.id ? null : channel.id)
                                  }}
                                  className={`p-1 rounded-full transition-all duration-200 ${
                                    isSelected
                                      ? 'text-white hover:bg-white hover:bg-opacity-20'
                                      : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                                  }`}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                
                                {showChannelMenu === channel.id && (
                                  <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-10 min-w-[160px]">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        togglePinChannel(channel.id)
                                      }}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-pink-50 flex items-center space-x-2 ${
                                        isPinned ? 'text-pink-600' : 'text-gray-700'
                                      }`}
                                    >
                                      <Pin size={14} />
                                      <span>{isPinned ? '取消置顶' : '置顶对话'}</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('确定要删除这个对话吗？此操作不可撤销。')) {
                                          deleteChannel(channel)
                                        }
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
                      )
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无聊天频道</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        还没有聊天频道<br/>
                        匹配用户后会自动创建<br/>
                        开始你的甜蜜对话吧！💕
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 聊天窗口 */}
              <div className="flex-1 flex flex-col bg-gradient-to-b from-pink-25 to-white">
                {selectedChannel ? (
                  <Channel channel={selectedChannel}>
                    <Window>
                      <ChannelHeader />
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        选择聊天对象
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-lg">
                        从左侧选择一个聊天频道<br/>
                        开始你们的甜蜜对话 💕
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Chat>
        </div>
      </div>
    </div>
  )
} 