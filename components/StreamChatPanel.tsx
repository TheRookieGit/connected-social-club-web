'use client'

import { useState, useEffect } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
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
  }, [currentUser, isClient])

  // 为匹配的用户创建频道
  const createChannelsForMatchedUsers = async () => {
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
      
      // 延迟刷新以确保频道创建完成
      setTimeout(() => {
        console.log('🔄 强制刷新频道列表...')
        setForceRefresh(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('💥 创建频道过程中出错:', error)
    }
  }

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
  }, [chatClient, currentUser, matchedUsers, channelsCreated])

  // 服务器端渲染时返回加载状态
  if (!isClient) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <p>加载聊天中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 显示错误状态
  if (initError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">聊天服务暂时不可用</h3>
            <p className="text-gray-600 mb-4">{initError}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setInitError(null)
                  window.location.reload()
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                重试
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>正在连接专业聊天服务...</p>
            <p className="text-sm text-gray-500 mt-2">首次连接可能需要几秒钟</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b bg-red-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold">💬 专业聊天</h3>
            <span className="bg-red-400 px-2 py-1 rounded-full text-xs font-semibold">
              {matchedUsers.length} 个匹配
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors p-1"
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
              <div className="w-1/3 border-r bg-gray-50">
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">已匹配用户</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {matchedUsers.length > 0 ? '点击开始聊天' : '暂无匹配用户'}
                      </p>
                      {/* 状态信息 */}
                      <div className="mt-2 text-xs text-gray-400 space-y-1">
                        <div>用户ID: {currentUser?.id} | 匹配数: {matchedUsers.length}</div>
                        <div>频道状态: {channelsCreated ? '✅ 已创建' : '⏳ 创建中'}</div>
                        <div>客户端: {chatClient ? '✅ 已连接' : '❌ 未连接'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          console.log('🔄 手动刷新频道列表')
                          setForceRefresh(prev => prev + 1)
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        title="刷新聊天列表"
                      >
                        🔄 刷新
                      </button>
                      <button
                        onClick={() => {
                          console.log('🛠️ 重新创建频道')
                          setChannelsCreated(false)
                        }}
                        className="text-green-500 hover:text-green-700 text-sm font-medium"
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
                        className="text-purple-500 hover:text-purple-700 text-sm font-medium"
                        title="查询频道"
                      >
                        🔍 查询
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 匹配用户显示 */}
                {matchedUsers.length > 0 ? (
                  <ChannelList 
                    key={forceRefresh} // 强制刷新的key
                    filters={{ 
                      type: 'messaging', 
                      members: { $in: [currentUser?.id.toString()] } 
                    }}
                    sort={{ last_message_at: -1, created_at: -1 }}
                    options={{ 
                      state: true, 
                      watch: true, 
                      presence: true,
                      limit: 20,
                      message_limit: 10
                    }}
                    showChannelSearch={false}
                  />
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      💬
                    </div>
                    <p className="text-sm">暂无匹配用户</p>
                    <p className="text-xs mt-1">去寻找你的另一半吧！</p>
                  </div>
                )}
              </div>

              {/* 聊天窗口 */}
              <div className="flex-1 flex flex-col">
                <Channel>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              </div>
            </div>
          </Chat>
        </div>
      </div>
    </div>
  )
} 