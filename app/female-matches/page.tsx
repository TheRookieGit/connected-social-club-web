'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, MapPin, Clock, User, AlertCircle } from 'lucide-react'

interface MatchedUser {
  id: number
  name: string
  age: number
  gender: string
  location: string
  bio: string
  occupation: string
  avatar_url: string
  isOnline: boolean
  lastSeen: string
  matchScore: number
  matchedAt: string
  initiatedByMe: boolean
}

interface StartConversationModalProps {
  user: MatchedUser | null
  isOpen: boolean
  onClose: () => void
  onStartConversation: (message: string) => void
  loading: boolean
}

// 开始对话模态框组件
function StartConversationModal({ user, isOpen, onClose, onStartConversation, loading }: StartConversationModalProps) {
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const messageTemplates = [
    '你好！很高兴认识你 😊',
    '嗨！看到我们匹配了，想和你聊聊',
    '你好呀！你的资料很有趣呢',
    'Hi！很高兴我们互相喜欢 💕',
    '你好！想了解一下你',
    '嗨！我们可以开始聊天吗？',
    '你好！你的照片很漂亮呢',
    'Hi！很高兴认识你，想和你交个朋友'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onStartConversation(message.trim())
    }
  }

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template)
    setMessage(template)
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <MessageCircle className="text-pink-500" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">开始对话</h3>
              <p className="text-sm text-gray-500">与 {user.name} 开始聊天</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          >
            <AlertCircle className="h-5 w-5" />
          </button>
        </div>

        {/* 用户信息 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-pink-600 font-semibold text-lg">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-500">{user.age}岁 • {user.location}</p>
            </div>
          </div>
        </div>

        {/* 消息输入 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发送第一条消息
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入你想说的话..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/500
            </div>
          </div>

          {/* 消息模板 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              快速选择
            </label>
            <div className="grid grid-cols-1 gap-2">
              {messageTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${
                    selectedTemplate === template
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '发送中...' : '开始对话'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FemaleMatchesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<MatchedUser | null>(null)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [conversationLoading, setConversationLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      alert('请先登录')
      router.push('/')
      return
    }

    const userData = JSON.parse(user)
    setCurrentUser(userData)
    
    // 验证用户性别
    if (userData.gender !== '女' && userData.gender !== 'female') {
      setError('此功能仅对女性用户开放')
      setLoading(false)
      return
    }
    
    loadMatchedUsers(token)
  }, [router])

  const loadMatchedUsers = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/matched-for-female', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMatchedUsers(data.matchedUsers)
        } else {
          setError(data.error || '加载失败')
        }
      } else {
        setError('网络错误')
      }
    } catch (error) {
      console.error('加载匹配用户失败:', error)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStartConversation = async (message: string) => {
    if (!selectedUser) return

    setConversationLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          message: message
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('对话开始成功！')
          setShowConversationModal(false)
          setSelectedUser(null)
          // 重新加载匹配用户列表
          loadMatchedUsers(token)
        } else {
          alert('开始对话失败: ' + data.error)
        }
      } else {
        alert('网络错误')
      }
    } catch (error) {
      console.error('开始对话失败:', error)
      alert('开始对话失败')
    } finally {
      setConversationLoading(false)
    }
  }

  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen) return '未知'
    
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 5) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="text-pink-500" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">我的匹配</h1>
                <p className="text-sm text-gray-500">
                  {matchedUsers.length > 0 
                    ? `${matchedUsers.length} 个已匹配的用户等待你的选择`
                    : '还没有匹配，继续浏览用户吧！'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              返回主页
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {matchedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-pink-500" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              暂无匹配
            </h2>
            <p className="text-gray-600 mb-6">
              你还没有匹配的用户。<br/>
              继续浏览用户来寻找你的完美匹配吧！
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              去发现用户
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 用户头像 */}
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-pink-400" size={48} />
                    </div>
                  )}
                  {user.isOnline && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-700">
                      匹配度 {user.matchScore}%
                    </span>
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <span className="text-sm text-gray-500">{user.age}岁</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                    <MapPin size={14} />
                    <span>{user.location}</span>
                  </div>
                  
                  {user.occupation && (
                    <p className="text-sm text-gray-600 mb-2">{user.occupation}</p>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {user.bio}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatLastSeen(user.lastSeen)}</span>
                    </div>
                    <span className={user.isOnline ? 'text-green-600' : 'text-gray-500'}>
                      {user.isOnline ? '在线' : '离线'}
                    </span>
                  </div>

                  {/* 开始对话按钮 */}
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setShowConversationModal(true)
                    }}
                    className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle size={16} />
                    <span>开始对话</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 开始对话模态框 */}
      <StartConversationModal
        user={selectedUser}
        isOpen={showConversationModal}
        onClose={() => {
          setShowConversationModal(false)
          setSelectedUser(null)
        }}
        onStartConversation={handleStartConversation}
        loading={conversationLoading}
      />
    </div>
  )
} 