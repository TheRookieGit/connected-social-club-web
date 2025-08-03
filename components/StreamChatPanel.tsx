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
    padding: 8px !important;
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
    display: flex !important;
    flex-direction: column !important;
  }
  
  .str-chat__channel-messaging {
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .str-chat__channel-messaging__main-panel {
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .str-chat__channel-messaging__main-panel-inner {
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .str-chat__channel-messaging__main-panel-inner .str-chat__message-list {
    flex: 1 !important;
    min-height: 0 !important;
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
    flex-shrink: 0 !important;
  }
  
  .str-chat__channel-header {
    border-bottom: 1px solid #e5e7eb !important;
    padding: 12px !important;
  }
  
  .str-chat__empty-state {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
    color: #6b7280 !important;
  }
  
  /* 隐藏消息头像，但保留其他元素 */
  .str-chat__message-avatar {
    display: none !important;
  }
  
  /* 基础聊天容器样式 - 简化版本 */
  .str-chat {
    height: 100% !important;
  }
  
  .str-chat__messaging {
    height: 100% !important;
  }
  
  /* 隐藏默认的频道头部 */
  .str-chat__channel-header {
    display: none !important;
  }
  
  /* 消息列表容器 */
  .str-chat__message-list {
    flex: 1 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    padding: 16px !important;
    background-color: #fafafa !important;
  }
  
  /* 输入框容器 */
  .str-chat__input {
    flex-shrink: 0 !important;
    border-top: 1px solid #e5e7eb !important;
  }
  
  /* 消息气泡样式 */
  .str-chat__message-bubble {
    border-radius: 18px !important;
    padding: 12px 16px !important;
    margin: 4px 0 !important;
    max-width: 70% !important;
  }
  
  /* 发送的消息样式 */
  .str-chat__message-bubble--sent {
    background-color: #ec4899 !important;
    color: white !important;
    margin-left: auto !important;
  }
  
  /* 接收的消息样式 */
  .str-chat__message-bubble--received {
    background-color: #f3f4f6 !important;
    color: #374151 !important;
    margin-right: auto !important;
  }
  
  /* 消息文本样式 - 修复垂直文本显示问题 */
  .str-chat__message-text {
    word-wrap: break-word !important;
    white-space: normal !important;
    display: block !important;
    line-height: 1.4 !important;
    font-family: inherit !important;
    font-size: 14px !important;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
  }
  
  /* 消息内容容器 */
  .str-chat__message-content {
    word-wrap: break-word !important;
    white-space: normal !important;
    display: block !important;
    line-height: 1.4 !important;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
  }
  
  /* 确保消息气泡内的文本正确显示 */
  .str-chat__message-bubble .str-chat__message-text,
  .str-chat__message-bubble .str-chat__message-content {
    word-wrap: break-word !important;
    white-space: normal !important;
    display: block !important;
    line-height: 1.4 !important;
    font-family: inherit !important;
    font-size: 14px !important;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
  }
  
  /* 强制修复所有文本显示问题 */
  .str-chat__message-bubble * {
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
    word-wrap: break-word !important;
    white-space: normal !important;
  }
  
  /* 隐藏错误状态图标 */
  .str-chat__message-status {
    display: none !important;
  }
  
  /* 隐藏消息失败指示器 */
  .str-chat__message-failed {
    display: none !important;
  }
  
  /* 输入框样式 */
  .str-chat__input-flat {
    border: none !important;
    border-top: 1px solid #e5e7eb !important;
    background-color: white !important;
  }
  
  .str-chat__input-flat--textarea {
    min-height: 44px !important;
    padding: 12px 16px !important;
    resize: none !important;
    word-wrap: break-word !important;
    white-space: normal !important;
    line-height: 1.4 !important;
    font-family: inherit !important;
    font-size: 14px !important;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
  }
  
  /* 发送按钮样式 */
  .str-chat__send-button {
    background-color: #ec4899 !important;
    border-radius: 50% !important;
    width: 32px !important;
    height: 32px !important;
  }
  
  /* 调整空状态文本大小 */
  .str-chat__empty-state,
  .str-chat__empty-state * {
    font-size: 12px !important;
  }
  
  /* 调整"No chats here yet..."文本大小 */
  .str-chat__empty-state p,
  .str-chat__empty-state div {
    font-size: 12px !important;
  }
  
  /* 隐藏文件选择相关的元素 */
  .str-chat__input-flat__button,
  .str-chat__input-flat__button--send,
  .str-chat__input-flat__button--upload,
  .str-chat__input-flat__button--emoji,
  .str-chat__input-flat__button--giphy,
  .str-chat__input-flat__button--commands,
  .str-chat__input-flat__button--file,
  .str-chat__input-flat__button--image,
  .str-chat__input-flat__button--audio,
  .str-chat__input-flat__button--video,
  .str-chat__input-flat__button--location,
  .str-chat__input-flat__button--calendar,
  .str-chat__input-flat__button--poll,
  .str-chat__input-flat__button--thread,
  .str-chat__input-flat__button--quote,
  .str-chat__input-flat__button--code,
  .str-chat__input-flat__button--link,
  .str-chat__input-flat__button--mention,
  .str-chat__input-flat__button--slash,
  .str-chat__input-flat__button--plus,
  .str-chat__input-flat__button--more,
  .str-chat__input-flat__button--attach,
  .str-chat__input-flat__button--attachment,
  .str-chat__input-flat__button--file-upload,
  .str-chat__input-flat__button--image-upload,
  .str-chat__input-flat__button--media-upload,
  .str-chat__input-flat__button--document-upload,
  .str-chat__input-flat__button--photo-upload,
  .str-chat__input-flat__button--video-upload,
  .str-chat__input-flat__button--audio-upload,
  .str-chat__input-flat__button--voice-upload,
  .str-chat__input-flat__button--location-upload,
  .str-chat__input-flat__button--contact-upload,
  .str-chat__input-flat__button--sticker-upload,
  .str-chat__input-flat__button--gif-upload,
  .str-chat__input-flat__button--emoji-upload,
  .str-chat__input-flat__button--reaction-upload,
  .str-chat__input-flat__button--poll-upload,
  .str-chat__input-flat__button--survey-upload,
  .str-chat__input-flat__button--quiz-upload,
  .str-chat__input-flat__button--game-upload,
  .str-chat__input-flat__button--app-upload,
  .str-chat__input-flat__button--integration-upload,
  .str-chat__input-flat__button--plugin-upload,
  .str-chat__input-flat__button--extension-upload,
  .str-chat__input-flat__button--addon-upload,
  .str-chat__input-flat__button--widget-upload,
  .str-chat__input-flat__button--tool-upload,
  .str-chat__input-flat__button--utility-upload,
  .str-chat__input-flat__button--feature-upload,
  .str-chat__input-flat__button--option-upload,
  .str-chat__input-flat__button--setting-upload,
  .str-chat__input-flat__button--config-upload,
  .str-chat__input-flat__button--pref-upload,
  .str-chat__input-flat__button--custom-upload {
    display: none !important;
  }
  
  /* 隐藏文件选择相关的文本和界面 */
  .str-chat__input-flat__text,
  .str-chat__input-flat__text--file,
  .str-chat__input-flat__text--image,
  .str-chat__input-flat__text--media,
  .str-chat__input-flat__text--document,
  .str-chat__input-flat__text--photo,
  .str-chat__input-flat__text--video,
  .str-chat__input-flat__text--audio,
  .str-chat__input-flat__text--voice,
  .str-chat__input-flat__text--location,
  .str-chat__input-flat__text--contact,
  .str-chat__input-flat__text--sticker,
  .str-chat__input-flat__text--gif,
  .str-chat__input-flat__text--emoji,
  .str-chat__input-flat__text--reaction,
  .str-chat__input-flat__text--poll,
  .str-chat__input-flat__text--survey,
  .str-chat__input-flat__text--quiz,
  .str-chat__input-flat__text--game,
  .str-chat__input-flat__text--app,
  .str-chat__input-flat__text--integration,
  .str-chat__input-flat__text--plugin,
  .str-chat__input-flat__text--extension,
  .str-chat__input-flat__text--addon,
  .str-chat__input-flat__text--widget,
  .str-chat__input-flat__text--tool,
  .str-chat__input-flat__text--utility,
  .str-chat__input-flat__text--feature,
  .str-chat__input-flat__text--option,
  .str-chat__input-flat__text--setting,
  .str-chat__input-flat__text--config,
  .str-chat__input-flat__text--pref,
  .str-chat__input-flat__text--custom {
    display: none !important;
  }
`

interface StreamChatPanelProps {
  matchedUsers: any[]
  initialUserId?: string
  isOpen: boolean
  onClose: () => void
}

export default function StreamChatPanel({ matchedUsers, initialUserId, isOpen, onClose }: StreamChatPanelProps) {
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
      console.log(`🔍 [StreamChatPanel] 用户 ${matchedUser?.name} (ID: ${otherUserId}) 的头像信息:`, {
        photos: matchedUser?.photos,
        avatar_url: matchedUser?.avatar_url,
        finalAvatarUrl: avatarUrl
      })
      
      return {
        id: otherUserId,
        name: member.user?.name || matchedUser?.name || `用户${otherUserId}`,
        image: undefined, // 不设置image，避免Stream Chat将其作为消息附件显示
        avatarUrl: avatarUrl, // 添加头像URL字段
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
      // 从matchedUsers中查找对应的用户数据
      const matchedUser = matchedUsers.find(user => user.id === otherUserId)
      
      if (matchedUser) {
        // 如果有个人简介，返回简介
        if (matchedUser.bio && matchedUser.bio.trim()) {
          return matchedUser.bio
        }
        // 如果有职业信息，返回职业
        if (matchedUser.occupation && matchedUser.occupation.trim()) {
          return matchedUser.occupation
        }
        // 如果有位置信息，返回位置
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
            image: undefined // 不设置image，避免Stream Chat将其作为消息附件显示
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

  // 处理用户头像点击
  const handleUserAvatarClick = (channel: any) => {
    console.log('🎯 点击用户头像，选择频道:', channel.id)
    console.log('📊 频道状态:', channel.state)
    setSelectedChannel(channel)
    setShowChatBox(true)
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



  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* LinkedIn风格的右侧用户头像列表 - 右下角固定，向上增高，扩大尺寸 */}
      <div className="fixed bottom-0 right-0 w-80 bg-white shadow-lg border-l border-gray-200 z-40 flex flex-col" 
           style={{ 
             maxHeight: isPanelCollapsed ? 'auto' : (windowHeight > 0 ? `${windowHeight * 0.8}px` : '80vh'),
             minHeight: isPanelCollapsed ? 'auto' : '400px',
             height: isPanelCollapsed ? 'auto' : (channels.length > 0 ? `${Math.min(channels.length * 80 + 100, windowHeight > 0 ? windowHeight * 0.8 : 800)}px` : '400px')
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
                              onError={(e) => {
                                console.log('头像加载失败，显示默认图标:', otherUser.name, 'URL:', otherUser.avatarUrl)
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) {
                                  fallback.style.display = 'flex'
                                }
                              }}
                              onLoad={() => {
                                console.log('头像加载成功:', otherUser.name, 'URL:', otherUser.avatarUrl)
                              }}
                            />
                          ) : null}
                          <span 
                            className="text-sm font-bold text-pink-600"
                            style={{ display: otherUser?.avatarUrl ? 'none' : 'flex' }}
                          >
                            {otherUser?.name?.charAt(0) || '?'}
                          </span>
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

             {/* LinkedIn风格的聊天框 - 调整大小避免遮挡用户卡片 */}
                               {showChatBox && selectedChannel && (
           <div
             className="fixed bottom-0 w-80 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col"
             style={{ right: 336 + 20 }}
           >
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