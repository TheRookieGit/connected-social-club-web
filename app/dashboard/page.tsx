'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, User as UserIcon, Settings, LogOut, Star, MapPin, Calendar, Users, Badge, Clock, Camera } from 'lucide-react'
import useSWR from 'swr'
import UserCard from '@/components/UserCard'
import ProfileModal from '@/components/ProfileModal'
import PendingMatchesPanel from '@/components/PendingMatchesPanel'
import LocationDisplay from '@/components/LocationDisplay'
import DraggablePhotoGrid from '@/components/DraggablePhotoGrid'
import { syncUserDataToLocalStorage } from '@/lib/hooks'
import { UserProfile } from '@/types/user'
import dynamic from 'next/dynamic'
import { shouldAutoRequestLocation, recordUserDenial } from '@/lib/locationPermission'

// 动态导入Stream Chat组件，避免SSR问题
const StreamChatPanel = dynamic(() => import('@/components/StreamChatPanel'), {
  ssr: false,
  loading: () => <div>加载专业聊天中...</div>
})

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
  const [showPendingMatches, setShowPendingMatches] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [showLocationPermission, setShowLocationPermission] = useState(false)
  const [isUpdatingPhotos, setIsUpdatingPhotos] = useState(false)
  const [deletedPhotos, setDeletedPhotos] = useState<string[]>([])

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

  // 获取待接受匹配数量
  const fetchPendingMatchesCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('fetchPendingMatchesCount: 没有token，跳过')
        return
      }

      console.log('fetchPendingMatchesCount: 开始获取待接受匹配数量...')
      const response = await fetch('/api/user/pending-matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPendingMatchesCount(data.total || 0)
          console.log('✅ 成功获取待接受匹配数量:', data.total)
        } else {
          console.error('❌ 获取待接受匹配数量失败:', data.error)
        }
      } else {
        console.error('❌ 获取待接受匹配数量请求失败，状态码:', response.status)
      }
    } catch (error) {
      console.error('❌ 获取待接受匹配数量失败:', error)
    }
  }

  // 检查登录状态并获取最新用户数据
  useEffect(() => {
    // 首先检查URL参数中是否有LinkedIn登录返回的token和用户数据
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const urlUser = urlParams.get('user')
    
    if (urlToken && urlUser) {
      console.log('Dashboard: 检测到LinkedIn登录回调参数，处理新的登录数据...')
      try {
        // 解析用户数据
        const userData = JSON.parse(decodeURIComponent(urlUser))
        console.log('Dashboard: LinkedIn用户数据:', userData)
        
        // 保存新的token和用户信息
        localStorage.setItem('token', urlToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        console.log('Dashboard: 已保存LinkedIn登录数据到localStorage')
        
        // 清理URL参数
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // 立即设置用户数据，避免重定向
        setCurrentUser(userData)
      } catch (error) {
        console.error('Dashboard: 处理LinkedIn登录数据时出错:', error)
      }
    }

    const initializeUserData = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (!token || !user) {
        console.log('Dashboard初始化: 没有登录信息，重定向到登录页面')
        router.push('/')
        return
      }

      console.log('Dashboard初始化: 发现登录信息，开始初始化...')

      try {
        // 先设置本地用户数据（这样用户界面可以立即显示）
        const localUserData = JSON.parse(user)
        console.log('Dashboard初始化: 本地用户数据:', localUserData)
        setCurrentUser(localUserData)
        
        // 立即从API获取最新数据
        console.log('Dashboard初始化: 从API获取最新用户数据...')
        const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
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
          // 如果是LinkedIn用户且是首次访问，给更多时间等待数据同步
          const userData = JSON.parse(user)
          if (userData.provider === 'linkedin' && response.status === 404) {
            console.log('Dashboard初始化: LinkedIn用户数据可能还在同步中，继续使用本地数据')
            // 继续使用localStorage中的用户数据，不要重定向
          } else if (response.status === 401) {
            // 只有在token真正无效时才重定向
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/')
            return
          }
          // 其他错误情况下，继续使用localStorage中的数据
        }
      } catch (error) {
        console.error('Dashboard初始化: 解析用户数据失败:', error)
        // 检查是否是LinkedIn用户，如果是则继续使用localStorage数据
        try {
          const userData = JSON.parse(user)
          if (userData.provider === 'linkedin') {
            console.log('Dashboard初始化: LinkedIn用户解析失败，但继续使用本地数据')
            setCurrentUser(userData)
          } else {
            // 非LinkedIn用户且解析失败，重定向到登录页面
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/')
            return
          }
        } catch (parseError) {
          console.error('Dashboard初始化: 无法解析用户数据，重定向到登录页面')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/')
          return
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeUserData()
    fetchMatchedUsers() // 获取已匹配的用户
    fetchPendingMatchesCount() // 获取待接受匹配数量
    
    // 检查是否需要请求位置权限
    const checkLocationPermission = () => {
      if (shouldAutoRequestLocation()) {
        console.log('Dashboard: 需要请求位置权限')
        setShowLocationPermission(true)
      }
    }
    
    // 延迟检查位置权限，确保用户数据加载完成
    setTimeout(checkLocationPermission, 1000)
    
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

    // 定期更新在线状态和匹配数据（每30秒）
    const dataRefreshInterval = setInterval(() => {
      updateOnlineStatus()
      fetchPendingMatchesCount() // 定期检查新的待接受匹配
    }, 30000)

    // 页面卸载时设置为离线
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('token')
      if (token) {
        navigator.sendBeacon('/api/user/online-status', JSON.stringify({ isOnline: false }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(dataRefreshInterval)
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

    console.log(`💖 [前端] 用户点击喜欢按钮 - 目标用户:`, currentUser)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [前端] 没有找到登录token')
        return
      }

      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
      console.log(`📤 [前端] 发送喜欢请求 - 当前用户ID: ${currentUserId}, 目标用户ID: ${currentUser.id}`)

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

      console.log(`📡 [前端] API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [前端] API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [前端] 匹配成功！与${currentUser.name}形成双向匹配`)
            // 重新获取已匹配用户列表
            fetchMatchedUsers()
            alert(`🎉 恭喜！你和${currentUser.name}匹配成功了！`)
          } else {
            console.log(`💌 [前端] 喜欢请求已发送给${currentUser.name}，等待对方回应`)
            if (data.pendingMatch) {
              console.log(`📋 [前端] 创建的待匹配记录:`, data.pendingMatch)
            }
            // 显示友好的提示信息
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-purple-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            notification.innerHTML = `💌 已向${currentUser.name}发送喜欢请求`
            document.body.appendChild(notification)
            setTimeout(() => {
              document.body.removeChild(notification)
            }, 3000)
          }
        } else {
          console.error('❌ [前端] API返回错误:', data.error)
          alert('操作失败: ' + data.error)
        }
      } else {
        console.error('❌ [前端] API请求失败，状态码:', response.status)
        const errorText = await response.text()
        console.error('❌ [前端] 错误详情:', errorText)
        alert('请求失败，请重试')
      }
    } catch (error) {
      console.error('❌ [前端] 处理喜欢操作失败:', error)
      alert('网络错误，请重试')
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handlePass = async () => {
    const currentUser = users[currentIndex]
    if (!currentUser) return

    console.log(`👎 [前端] 用户点击跳过按钮 - 目标用户:`, currentUser)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
      console.log(`📤 [前端] 发送跳过请求 - 当前用户ID: ${currentUserId}, 目标用户ID: ${currentUser.id}`)

      const response = await fetch('/api/user/matches', {
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

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [前端] 跳过操作响应:`, data)
      } else {
        console.error('❌ [前端] 跳过操作失败')
      }
    } catch (error) {
      console.error('❌ [前端] 处理跳过失败:', error)
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handleSuperLike = async () => {
    const currentUser = users[currentIndex]
    if (!currentUser) return

    console.log(`⭐ [前端] 用户点击超级喜欢按钮 - 目标用户:`, currentUser)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
      console.log(`📤 [前端] 发送超级喜欢请求 - 当前用户ID: ${currentUserId}, 目标用户ID: ${currentUser.id}`)

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

      console.log(`📡 [前端] 超级喜欢API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [前端] 超级喜欢API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [前端] 超级喜欢匹配成功！与${currentUser.name}形成双向匹配`)
            // 重新获取已匹配用户列表
            fetchMatchedUsers()
            alert(`🎉 恭喜！你的超级喜欢生效了，你和${currentUser.name}匹配成功！`)
          } else {
            console.log(`⭐ [前端] 超级喜欢请求已发送给${currentUser.name}，等待对方回应`)
            if (data.pendingMatch) {
              console.log(`📋 [前端] 创建的超级喜欢待匹配记录:`, data.pendingMatch)
            }
            // 显示友好的提示信息
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            notification.innerHTML = `⭐ 已向${currentUser.name}发送超级喜欢请求`
            document.body.appendChild(notification)
            setTimeout(() => {
              document.body.removeChild(notification)
            }, 3000)
          }
        } else {
          console.error('❌ [前端] 超级喜欢API返回错误:', data.error)
          alert('操作失败: ' + data.error)
        }
      } else {
        console.error('❌ [前端] 超级喜欢API请求失败')
        alert('请求失败，请重试')
      }
    } catch (error) {
      console.error('❌ [前端] 处理超级喜欢失败:', error)
      alert('网络错误，请重试')
    }

    setCurrentIndex(prev => prev + 1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  // 处理照片变化（排序或删除）
  const handlePhotosChange = async (newPhotos: string[]) => {
    if (!currentUser) return

    setIsUpdatingPhotos(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未找到登录令牌')
      }

      const response = await fetch('/api/user/update-photos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photos: newPhotos,
          deletedPhotos: deletedPhotos
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新照片失败')
      }

      const result = await response.json()
      console.log('照片更新成功:', result)

      // 更新本地状态
      setCurrentUser(prev => prev ? { ...prev, photos: newPhotos } : null)
      setDeletedPhotos([]) // 清空删除记录

      // 同步到localStorage
      const updatedUser = { ...currentUser, photos: newPhotos }
      syncUserDataToLocalStorage(updatedUser, '照片更新')

    } catch (error) {
      console.error('更新照片失败:', error)
      alert(`更新照片失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsUpdatingPhotos(false)
    }
  }

  // 处理添加照片
  const handleAddPhoto = () => {
    router.push('/photos')
  }

  // 处理删除照片
  const handleDeletePhoto = (index: number) => {
    if (!currentUser?.photos) return
    
    const photoToDelete = currentUser.photos[index]
    setDeletedPhotos(prev => [...prev, photoToDelete])
  }

  // 当接受匹配后的回调函数
  const handleMatchAccepted = async () => {
    console.log('🔄 [前端] 匹配被接受，开始刷新数据...')
    
    // 立即刷新已匹配用户列表
    await fetchMatchedUsers()
    
    // 刷新待接受匹配数量
    await fetchPendingMatchesCount()
    
    console.log('✅ [前端] 数据刷新完成')
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
              <h1 className="text-2xl font-bold text-red-500">ConnectEd Elite Social Club</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 待接受匹配按钮 */}
              <motion.button
                onClick={() => setShowPendingMatches(true)}
                className="relative p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock size={20} />
                {pendingMatchesCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {pendingMatchesCount > 9 ? '9+' : pendingMatchesCount}
                  </motion.span>
                )}
              </motion.button>

              {/* 专业聊天按钮（已升级为Stream Chat） */}
              <motion.button
                onClick={() => setShowChat(true)}
                className="relative p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="专业级实时聊天 - 已升级！"
              >
                <Users size={20} />
                {matchedUsers.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {matchedUsers.length}
                  </motion.span>
                )}
                {/* 升级标识 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -left-2 bg-green-500 text-white text-[8px] rounded-full px-1.5 py-0.5 font-bold"
                >
                  升级
                </motion.div>
              </motion.button>


              
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors flex items-center"
              >
                {currentUser?.avatar_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 hover:border-red-500 transition-colors">
                    <Image 
                      src={currentUser.avatar_url} 
                      alt={currentUser.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('导航栏头像加载失败，显示默认图标')
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.parentElement?.nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.style.display = 'block'
                        }
                      }}
                    />
                  </div>
                ) : null}
                <UserIcon 
                  size={24} 
                  className={currentUser?.avatar_url ? 'hidden' : ''}
                />
              </button>

              {/* 重新进行注册流程按钮 */}
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token')
                    if (!token) {
                      alert('请先登录')
                      return
                    }

                    // 询问用户是否要重新开始整个流程
                    const shouldRestart = confirm('您希望：\n\n1. 点击"确定" - 重新开始整个注册流程（从性别选择开始）\n2. 点击"取消" - 继续完善当前缺失的资料\n\n请选择：')
                    
                    if (shouldRestart) {
                      // 重新开始整个流程
                      router.push('/gender-selection?restart=true')
                    } else {
                      // 继续完善当前缺失的资料
                      const response = await fetch('/api/user/registration-status', {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      })

                      if (response.ok) {
                        const data = await response.json()
                        if (data.success) {
                          if (data.isComplete) {
                            alert('您的资料已经完整了！')
                          } else {
                            router.push(data.nextStep)
                          }
                        } else {
                          alert('检查状态失败: ' + data.error)
                        }
                      } else {
                        alert('请求失败，请重试')
                      }
                    }
                  } catch (error) {
                    console.error('检查注册状态失败:', error)
                    alert('网络错误，请重试')
                  }
                }}
                className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                title="重新进行注册流程的填写"
              >
                <Badge size={24} />
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

              {/* 照片管理按钮 */}
              <button
                onClick={() => router.push('/user-photos')}
                className="p-2 text-gray-600 hover:text-green-500 transition-colors"
                title="我的照片"
              >
                <Camera size={24} />
              </button>

              {/* 位置设置按钮 */}
              <button
                onClick={() => router.push('/location-settings')}
                className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                title="位置设置"
              >
                <MapPin size={24} />
              </button>
              
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
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* 位置显示 - 右上角 */}
        <div className="absolute top-0 right-4 z-10 flex items-center space-x-2">
          {(() => {
            try {
              const remembered = localStorage.getItem('location_permission_remembered')
              const userLocation = localStorage.getItem('user_location')
              return remembered === 'true' || userLocation
            } catch (error) {
              return false
            }
          })() && (
            <LocationDisplay compact={true} showRefresh={false} />
          )}
          
          {/* 位置设置按钮 */}
          <button
            onClick={() => router.push('/location-settings')}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
            title="位置设置"
          >
            <MapPin className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* 我的匹配概览区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Users className="text-red-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">我的匹配</h2>
                  <p className="text-gray-500">
                    {matchedUsers.length > 0 
                      ? `你有 ${matchedUsers.length} 个已匹配用户`
                      : '还没有匹配，继续浏览寻找你的另一半吧！'
                    }
                    {pendingMatchesCount > 0 && (
                      <span className="text-purple-600 font-medium ml-2">
                        • {pendingMatchesCount} 个待处理
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {pendingMatchesCount > 0 && (
                  <motion.button
                    onClick={() => setShowPendingMatches(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    处理待匹配 ({pendingMatchesCount})
                  </motion.button>
                )}
                
                {matchedUsers.length > 0 && (
                  <motion.button
                    onClick={() => setShowChat(true)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    开始聊天
                  </motion.button>
                )}

                {/* 重新进行注册流程按钮 */}
                <motion.button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token')
                      if (!token) {
                        alert('请先登录')
                        return
                      }

                      // 询问用户是否要重新开始整个流程
                      const shouldRestart = confirm('您希望：\n\n1. 点击"确定" - 重新开始整个注册流程（从性别选择开始）\n2. 点击"取消" - 继续完善当前缺失的资料\n\n请选择：')
                      
                      if (shouldRestart) {
                        // 重新开始整个流程
                        router.push('/gender-selection')
                      } else {
                        // 继续完善当前缺失的资料
                        const response = await fetch('/api/user/registration-status', {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })

                        if (response.ok) {
                          const data = await response.json()
                          if (data.success) {
                            if (data.isComplete) {
                              alert('您的资料已经完整了！')
                            } else {
                              router.push(data.nextStep)
                            }
                          } else {
                            alert('检查状态失败: ' + data.error)
                          }
                        } else {
                          alert('请求失败，请重试')
                        }
                      }
                    } catch (error) {
                      console.error('检查注册状态失败:', error)
                      alert('网络错误，请重试')
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Badge size={16} />
                  <span>完善资料</span>
                </motion.button>
              </div>
            </div>
            
            {/* 匹配用户预览 */}
            {matchedUsers.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {matchedUsers.slice(0, 5).map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex-shrink-0 w-20 text-center cursor-pointer"
                    onClick={() => setShowChat(true)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                      <span className="text-red-600 font-medium text-lg">
                        {user.name.charAt(0)}
                      </span>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium truncate">{user.name}</p>
                  </motion.div>
                ))}
                {matchedUsers.length > 5 && (
                  <motion.div
                    className="flex-shrink-0 w-20 text-center cursor-pointer"
                    onClick={() => setShowChat(true)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-500 font-medium">+{matchedUsers.length - 5}</span>
                    </div>
                    <p className="text-xs text-gray-600">更多</p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* 我的照片区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">我的照片</h2>
                <p className="text-gray-500">管理你的个人照片</p>
              </div>
              {isUpdatingPhotos && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>更新中...</span>
                </div>
              )}
            </div>
          </div>

          {currentUser?.photos && currentUser.photos.length > 0 ? (
            <DraggablePhotoGrid
              photos={currentUser.photos}
              onPhotosChange={handlePhotosChange}
              onAddPhoto={handleAddPhoto}
              maxPhotos={6}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有照片</h3>
              <p className="text-gray-500 mb-4">上传一些照片来展示你的魅力吧！</p>
              <motion.button
                onClick={handleAddPhoto}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                上传照片
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* 推荐用户区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">为你推荐</h2>
            <p className="text-gray-500">根据你的喜好为你推荐的用户</p>
          </div>

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
              <h3 className="text-2xl font-bold text-gray-700 mb-4">没有更多推荐了</h3>
              <p className="text-gray-500 mb-6">稍后再来看看吧！</p>
              <div className="flex justify-center space-x-4">
                {pendingMatchesCount > 0 && (
                  <motion.button
                    onClick={() => setShowPendingMatches(true)}
                    className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    处理待匹配 ({pendingMatchesCount})
                  </motion.button>
                )}
                {matchedUsers.length > 0 && (
                  <motion.button
                    onClick={() => setShowChat(true)}
                    className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    查看我的匹配
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* 待接受匹配面板 */}
      {showPendingMatches && (
        <PendingMatchesPanel
          onClose={() => setShowPendingMatches(false)}
          onMatchAccepted={handleMatchAccepted}
        />
      )}

      {/* 专业聊天面板（已替代原来的ChatPanel） */}
      {showChat && (
        <StreamChatPanel
          matchedUsers={matchedUsers}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* 个人资料模态框 */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          userId={currentUser?.id?.toString() || ''}
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
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0'
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

      {/* 位置权限请求模态框 */}
      {showLocationPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">位置服务</h3>
              <p className="text-gray-600 mb-6">
                为了提供更好的匹配服务，我们需要获取您的位置信息。
                <br />
                这将帮助我们为您推荐附近的用户。
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    // 记录用户拒绝，24小时内不再询问
                    recordUserDenial(false)
                    setShowLocationPermission(false)
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  稍后再说
                </button>
                <button
                  onClick={() => {
                    setShowLocationPermission(false)
                    // 这里可以添加获取位置的逻辑
                    // 或者跳转到登录表单的位置权限请求
                    router.push('/?showLocationPermission=true')
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  允许访问
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 