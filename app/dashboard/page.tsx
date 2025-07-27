'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, User as UserIcon, Settings, LogOut, Star, MapPin, Calendar } from 'lucide-react'
import useSWR from 'swr'
import UserCard from '@/components/UserCard'
import ChatPanel from '@/components/ChatPanel'
import ProfileModal from '@/components/ProfileModal'
import { syncUserDataToLocalStorage } from '@/lib/hooks'

// 推荐用户的类型定义
interface RecommendedUser {
  id: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  photos: string[]
  isOnline: boolean
}

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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])

  // 获取已匹配的用户
  const fetchMatchedUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('fetchMatchedUsers: 没有token，跳过')
        return
      }

      console.log('fetchMatchedUsers: 开始获取已匹配用户...')
      const response = await fetch('/api/user/matched-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('fetchMatchedUsers: API响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('fetchMatchedUsers: API返回数据:', data)
        
        if (data.success) {
          if (data.matchedUsers && data.matchedUsers.length > 0) {
            const formattedUsers: RecommendedUser[] = data.matchedUsers.map((user: any) => ({
              id: user.id.toString(),
              name: user.name,
              age: user.age,
              location: user.location,
              bio: user.bio,
              interests: [], // 可以后续添加兴趣获取
              photos: [user.avatar_url || '/api/placeholder/400/600'],
              isOnline: user.isOnline
            }))
            setMatchedUsers(formattedUsers)
            console.log('✅ 成功获取到已匹配用户:', formattedUsers)
          } else {
            console.log('📭 没有找到已匹配的用户')
            setMatchedUsers([])
          }
        } else {
          console.error('❌ API返回失败:', data.error)
        }
      } else {
        console.error('❌ API请求失败，状态码:', response.status)
        const errorText = await response.text()
        console.error('❌ 错误详情:', errorText)
      }
    } catch (error) {
      console.error('❌ 获取已匹配用户失败:', error)
    }
  }

  // 检查登录状态并获取最新用户数据
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.push('/')
      return
    }
    
    // 验证token并获取最新用户数据
    const initializeUserData = async () => {
      try {
        // 先设置临时用户数据，避免白屏
        const userData = JSON.parse(user)
        setCurrentUser(userData)
        
        // 立即从API获取最新数据
        console.log('Dashboard初始化: 从API获取最新用户数据...')
        const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('Dashboard初始化: 获取到最新用户数据:', data.user)
            // 更新组件状态
            setCurrentUser(data.user)
            // 同步更新localStorage
            syncUserDataToLocalStorage(data.user, 'Dashboard初始化')
          } else {
            console.error('Dashboard初始化: API返回错误:', data.error)
          }
        } else {
          console.error('Dashboard初始化: API请求失败:', response.status)
          // 如果API请求失败，token可能已过期
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/')
            return
          }
        }
      } catch (error) {
        console.error('Dashboard初始化: 解析用户数据失败:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
        return
      } finally {
        setIsLoading(false)
      }
    }

    initializeUserData()
    fetchMatchedUsers() // 获取已匹配的用户
    
    // 更新在线状态
    const updateOnlineStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          await fetch('/api/user/online-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isOnline: true })
          })
        }
      } catch (error) {
        console.error('更新在线状态失败:', error)
      }
    }
    
    updateOnlineStatus()

    // 定期更新在线状态（每30秒）
    const onlineInterval = setInterval(updateOnlineStatus, 30000)

    // 页面卸载时设置为离线
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('token')
      if (token) {
        navigator.sendBeacon('/api/user/online-status', JSON.stringify({ isOnline: false }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(onlineInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [router])

  // 计算年龄的辅助函数
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  // 获取推荐用户数据
  useEffect(() => {
    if (isLoading || !currentUser) return
    
    const fetchRecommendedUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/user/matches?limit=10', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // 转换数据格式以匹配现有组件
            const formattedUsers: User[] = data.users.map((user: any) => ({
              id: user.id.toString(),
              name: user.name,
              age: calculateAge(user.birth_date),
              location: user.location || '未知',
              bio: user.bio || '这个人很神秘...',
              interests: user.interests || [],
              photos: [user.avatar_url || '/api/placeholder/400/600'],
              isOnline: user.is_online || false
            }))
            setUsers(formattedUsers)
          }
        }
      } catch (error) {
        console.error('获取推荐用户失败:', error)
      }
    }

    fetchRecommendedUsers()
  }, [isLoading, currentUser])

  // 处理喜欢操作
  const handleLike = async () => {
    const currentUser = users[currentIndex]
    if (!currentUser) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: currentUser.id,
          action: 'like'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.isMatch) {
          // 重新获取已匹配用户列表
          fetchMatchedUsers()
          alert(`恭喜！你和${currentUser.name}匹配成功了！`)
        }
      }
    } catch (error) {
      console.error('处理喜欢失败:', error)
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handlePass = async () => {
    const currentUser = users[currentIndex]
    if (!currentUser) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: currentUser.id,
          action: 'pass'
        })
      })
    } catch (error) {
      console.error('处理跳过失败:', error)
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handleSuperLike = async () => {
    const currentUser = users[currentIndex]
    if (!currentUser) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: currentUser.id,
          action: 'super_like'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.isMatch) {
          // 重新获取已匹配用户列表
          fetchMatchedUsers()
          alert(`恭喜！你和${currentUser.name}匹配成功了！`)
        }
      }
    } catch (error) {
      console.error('处理超级喜欢失败:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  const currentUserCard = users[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-red-500">社交俱乐部</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <MessageCircle size={24} />
              </button>
              
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <UserIcon size={24} />
              </button>
              
              {/* 管理员控制台入口 */}
              {(() => {
                console.log('Dashboard: 检查管理员权限...')
                console.log('Dashboard: currentUser:', currentUser)
                console.log('Dashboard: currentUser.email:', currentUser?.email)
                console.log('Dashboard: 是否为管理员:', currentUser?.email === 'admin@socialclub.com')
                return currentUser?.email === 'admin@socialclub.com'
              })() && (
                <button
                  onClick={() => {
                    console.log('Dashboard: 点击管理员控制台按钮')
                    router.push('/admin')
                  }}
                  className="p-2 text-gray-600 hover:text-purple-500 transition-colors"
                  title="管理员控制台"
                >
                  <Settings size={24} />
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentUserCard ? (
          <div className="flex flex-col items-center">
            <UserCard user={currentUserCard} />
            
            {/* 操作按钮 */}
            <div className="flex justify-center space-x-8 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePass}
                className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-gray-500 transition-colors"
              >
                ✕
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSuperLike}
                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Star size={24} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
              >
                <Heart size={24} />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">没有更多推荐了</h2>
            <p className="text-gray-500">稍后再来看看吧！</p>
          </div>
        )}
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
          onClose={() => {
            setShowProfile(false)
            // 关闭个人资料模态框后，重新获取用户资料
            const refreshUserProfile = async () => {
              try {
                const token = localStorage.getItem('token')
                if (!token) return

                console.log('Dashboard: 重新获取用户资料...')
                const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                  }
                })

                if (response.ok) {
                  const data = await response.json()
                  if (data.success) {
                    console.log('Dashboard: 获取到最新用户资料:', data.user)
                    setCurrentUser(data.user)
                    
                                         // 重要：同步更新localStorage中的用户数据
                     syncUserDataToLocalStorage(data.user, 'Dashboard关闭ProfileModal')
                  }
                }
              } catch (error) {
                console.error('Dashboard: 重新获取用户资料失败:', error)
              }
            }
            
            refreshUserProfile()
          }}
        />
      )}
    </div>
  )
} 