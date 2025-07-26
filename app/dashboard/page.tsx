'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, User, Settings, LogOut, Star, MapPin, Calendar } from 'lucide-react'
import UserCard from '@/components/UserCard'
import ChatPanel from '@/components/ChatPanel'
import ProfileModal from '@/components/ProfileModal'

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

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 检查用户认证
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.push('/')
      return
    }
    
    try {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
      return
    }
    
    setIsLoading(false)
  }, [router])

  // 模拟用户数据
  useEffect(() => {
    if (isLoading) return
    const mockUsers: User[] = [
      {
        id: '1',
        name: '小雨',
        age: 25,
        location: '北京',
        bio: '喜欢旅行和摄影，寻找有趣的灵魂',
        interests: ['旅行', '摄影', '音乐', '美食'],
        photos: ['/api/placeholder/400/600'],
        isOnline: true
      },
      {
        id: '2',
        name: '小明',
        age: 28,
        location: '上海',
        bio: '程序员一枚，热爱技术，也喜欢户外运动',
        interests: ['编程', '健身', '电影', '咖啡'],
        photos: ['/api/placeholder/400/600'],
        isOnline: false
      },
      {
        id: '3',
        name: '小红',
        age: 23,
        location: '深圳',
        bio: '设计师，喜欢艺术和创意，寻找志同道合的人',
        interests: ['设计', '艺术', '阅读', '瑜伽'],
        photos: ['/api/placeholder/400/600'],
        isOnline: true
      }
    ]
    setUsers(mockUsers)
  }, [])

  const handleLike = () => {
    const currentUser = users[currentIndex]
    if (currentUser) {
      setMatchedUsers(prev => [...prev, currentUser])
      // 模拟匹配成功
      if (Math.random() > 0.5) {
        alert(`恭喜！你和${currentUser.name}匹配成功了！`)
      }
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1)
  }

  const handleSuperLike = () => {
    const currentUser = users[currentIndex]
    if (currentUser) {
      setMatchedUsers(prev => [...prev, currentUser])
      alert(`超级喜欢！你和${currentUser.name}匹配成功了！`)
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">社交俱乐部</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                {matchedUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {matchedUsers.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <User className="h-6 w-6" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                <Settings className="h-6 w-6" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主内容区域 - 用户卡片 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">发现新朋友</h2>
              
              {currentIndex < users.length ? (
                <motion.div
                  key={users[currentIndex].id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserCard user={users[currentIndex]} />
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    暂时没有更多推荐
                  </h3>
                  <p className="text-gray-500">
                    稍后再来看看吧，或者调整你的偏好设置
                  </p>
                </div>
              )}

              {/* 操作按钮 */}
              {currentIndex < users.length && (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={handlePass}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                  
                  <button
                    onClick={handleSuperLike}
                    className="p-4 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <Star className="h-6 w-6 text-blue-500" />
                  </button>
                  
                  <button
                    onClick={handleLike}
                    className="p-4 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                  >
                    <Heart className="h-6 w-6 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 - 匹配列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">我的匹配</h3>
              
              {matchedUsers.length > 0 ? (
                <div className="space-y-4">
                  {matchedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setShowChat(true)}
                    >
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.age}岁 · {user.location}</p>
                      </div>
                      {user.isOnline && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">还没有匹配，继续探索吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 聊天面板 */}
      {showChat && (
        <ChatPanel
          matchedUsers={matchedUsers}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* 个人资料模态框 */}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
} 