'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, User as UserIcon, Settings, LogOut, Star, MapPin, Calendar, Users, Badge, Clock, Flower, RefreshCw } from 'lucide-react'
import useSWR from 'swr'
import UserCard from '@/components/UserCard'
import ProfileModal from '@/components/ProfileModal'
import PendingMatchesPanel from '@/components/PendingMatchesPanel'
import LocationDisplay from '@/components/LocationDisplay'
import UserDetailModal from '@/components/UserDetailModal'
import { syncUserDataToLocalStorage } from '@/lib/hooks'
import { UserProfile } from '@/types/user'
import dynamic from 'next/dynamic'
import { shouldAutoRequestLocation, recordUserDenial } from '@/lib/locationPermission'

// 动态导入聊天面板组件，避免SSR问题
const StreamChatPanel = dynamic(() => import('@/components/StreamChatPanel'), {
  ssr: false,
  loading: () => null
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
  // 扩展的个人资料字段
  occupation?: string
  education?: string
  relationship_status?: string
  height?: number
  weight?: number
  ethnicity?: string
  religion?: string
  employer?: string
  school?: string
  degree?: string
  values_preferences?: string[]
  personality_type?: string
  languages?: string[]
  family_plans?: string
  has_kids?: string | boolean
  smoking_status?: string
  drinking_status?: string
  dating_style?: string
  relationship_goals?: string[]
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showChat, setShowChat] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [showPendingMatches, setShowPendingMatches] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [showLocationPermission, setShowLocationPermission] = useState(false)
  const [initialChatUserId, setInitialChatUserId] = useState<string | null>(null)
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // 获取已匹配的用户
  const fetchMatchedUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('fetchMatchedUsers: 没有token，跳过')
        return
      }

      console.log('fetchMatchedUsers: 开始获取已匹配用户...')
      // 添加时间戳来避免缓存，确保获取最新数据
      const timestamp = Date.now()
      const response = await fetch(`/api/user/matched-users?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      console.log('fetchMatchedUsers: API响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('fetchMatchedUsers: API返回数据:', data)
        
        if (data.success) {
          if (data.matchedUsers && data.matchedUsers.length > 0) {
            console.log('🔍 原始匹配用户数据:', data.matchedUsers)
            const formattedUsers: RecommendedUser[] = data.matchedUsers.map((user: any) => {
              console.log(`🔍 用户 ${user.name} 的照片数据:`, user.photos)
              return {
                id: user.id.toString(),
                name: user.name,
                age: user.age,
                location: user.location,
                bio: user.bio,
                interests: [], // 可以后续添加兴趣获取
                photos: user.photos && user.photos.length > 0 ? user.photos : (user.avatar_url ? [user.avatar_url] : ['/api/placeholder/400/600']),
                isOnline: user.isOnline
              }
            })
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
      // 添加时间戳来避免缓存，确保获取最新数据
      const timestamp = Date.now()
      const response = await fetch(`/api/user/pending-matches?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
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
    // 检查URL参数中是否有showChat参数
    const showChatParam = searchParams.get('showChat')
    const userIdParam = searchParams.get('userId')
    
    if (showChatParam === 'true') {
      console.log('Dashboard: 检测到showChat参数，自动显示聊天界面')
      setShowChat(true)
      
      // 如果有指定用户ID，保存到状态中
      if (userIdParam) {
        console.log('Dashboard: 检测到userId参数，保存到状态:', userIdParam)
        setInitialChatUserId(userIdParam)
      }
      
      // 清理URL参数
      router.replace('/dashboard')
    }

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
    
    // 设置定期刷新已匹配用户数据，每60秒更新一次
    const matchedUsersInterval = setInterval(fetchMatchedUsers, 60000)
    
    // 设置定期刷新待接受匹配数量，每30秒更新一次
    const pendingMatchesInterval = setInterval(fetchPendingMatchesCount, 30000)
    
    // 清理定时器
    return () => {
      clearInterval(matchedUsersInterval)
      clearInterval(pendingMatchesInterval)
    }
    
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
  }, [router, searchParams])

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

  // 获取推荐用户
  useEffect(() => {
    if (isLoading || !currentUser) return
    
    const fetchRecommendedUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // 添加时间戳来避免缓存，确保获取最新数据
        const timestamp = Date.now()
        const response = await fetch(`/api/user/matches?limit=10&t=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('Dashboard - API返回的原始用户数据:', data.users)
            // 转换数据格式以匹配现有组件
            const formattedUsers: User[] = data.users.map((user: any) => {
              // 过滤和验证照片数组，移除无效的照片URL
              let validPhotos = []
              if (user.photos && Array.isArray(user.photos)) {
                console.log(`用户 ${user.name} 的原始照片数组:`, user.photos)
                validPhotos = user.photos.filter((photo: string) => {
                  // 过滤掉空值、null、undefined和占位符URL
                  const isValid = photo && 
                         photo !== null && 
                         photo !== undefined && 
                         photo !== '' && 
                         photo !== '/api/placeholder/400/600' &&
                         !photo.includes('placeholder')
                  if (!isValid) {
                    console.log(`过滤掉无效照片: ${photo}`)
                  }
                  return isValid
                })
                console.log(`用户 ${user.name} 的有效照片数组:`, validPhotos)
              }
              
              // 如果没有有效照片，使用头像或占位符
              if (validPhotos.length === 0) {
                validPhotos = user.avatar_url ? [user.avatar_url] : ['/api/placeholder/400/600']
              }
              
              return {
                id: user.id.toString(),
                name: user.name,
                age: calculateAge(user.birth_date),
                location: user.location || '未知',
                bio: user.bio || '这个人很神秘...',
                interests: user.interests || [],
                                photos: validPhotos,
                isOnline: user.is_online || false,
                // 扩展的个人资料字段
                occupation: user.occupation,
                education: user.education,
                relationship_status: user.relationship_status,
                height: user.height,
                weight: user.weight,
                ethnicity: user.ethnicity,
                religion: user.religion,
                employer: user.employer,
                school: user.school,
                degree: user.degree,
                values_preferences: user.values_preferences,
                personality_type: user.personality_type,
                languages: user.languages,
                family_plans: user.family_plans,
                has_kids: user.has_kids,
                smoking_status: user.smoking_status,
                drinking_status: user.drinking_status,
                dating_style: user.dating_style,
                relationship_goals: user.relationship_goals
              }
            })
            console.log('Dashboard - 格式化后的用户数据:', formattedUsers)
            setUsers(formattedUsers)
          }
        }
      } catch (error) {
        console.error('获取推荐用户失败:', error)
      }
    }

    fetchRecommendedUsers()

    // 设置定期刷新，每30秒更新一次推荐用户数据
    const refreshInterval = setInterval(fetchRecommendedUsers, 30000)

    // 清理定时器
    return () => clearInterval(refreshInterval)
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

      console.log(`📤 [前端] 发送喜欢请求 - 目标用户ID: ${currentUser.id}`)

      // 使用 user_matches API
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

      console.log(`📡 [前端] user_matches API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [前端] user_matches API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [前端] 匹配成功！与${currentUser.name}形成双向匹配`)
            // 重新获取已匹配用户列表
            fetchMatchedUsers()
            alert(`🎉 恭喜！你和${currentUser.name}匹配成功了！`)
          } else {
            console.log(`💌 [前端] 喜欢请求已发送给${currentUser.name}，等待对方回应`)
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
          console.error('❌ [前端] user_matches API返回错误:', data.error)
          alert('操作失败: ' + data.error)
        }
      } else {
        console.error('❌ [前端] user_matches API请求失败，状态码:', response.status)
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

      console.log(`📤 [前端] 发送超级喜欢请求 - 目标用户ID: ${currentUser.id}`)

      // 使用 user_matches API 发送超级喜欢
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

  // 当接受匹配后的回调函数
  const handleMatchAccepted = async () => {
    console.log('🔄 [前端] 匹配被接受，开始刷新数据...')
    
    // 立即刷新已匹配用户列表
    await fetchMatchedUsers()
    
    // 刷新待接受匹配数量
    await fetchPendingMatchesCount()
    
    console.log('✅ [前端] 数据刷新完成')
  }

  // 处理用户头像点击，跳转到用户个人资料页面
  const handleUserAvatarClick = (userId: string) => {
    router.push(`/user-profile/${userId}`)
  }

  // 处理用户卡片点击，显示详情模态框
  const handleUserCardClick = (user: User) => {
    console.log('Dashboard - 点击用户卡片，用户数据:', user)
    setSelectedUser(user)
    setShowUserDetailModal(true)
  }

  // 处理模态框中的喜欢操作
  const handleModalLike = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    console.log(`💖 [模态框] 用户点击喜欢按钮 - 目标用户:`, user)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [模态框] 没有找到登录token')
        return
      }

      console.log(`📤 [模态框] 发送喜欢请求 - 目标用户ID: ${userId}`)

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: userId,
          action: 'like'
        })
      })

      console.log(`📡 [模态框] API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [模态框] API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [模态框] 匹配成功！与${user.name}形成双向匹配`)
            fetchMatchedUsers()
            alert(`🎉 恭喜！你和${user.name}匹配成功了！`)
          } else {
            console.log(`💌 [模态框] 喜欢请求已发送给${user.name}，等待对方回应`)
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-purple-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            notification.innerHTML = `💌 已向${user.name}发送喜欢请求`
            document.body.appendChild(notification)
            setTimeout(() => {
              document.body.removeChild(notification)
            }, 3000)
          }
        } else {
          console.error('❌ [模态框] API返回错误:', data.error)
          alert('操作失败: ' + data.error)
        }
      } else {
        console.error('❌ [模态框] API请求失败，状态码:', response.status)
        alert('请求失败，请重试')
      }
    } catch (error) {
      console.error('❌ [模态框] 处理喜欢操作失败:', error)
      alert('网络错误，请重试')
    }

    setCurrentIndex(prev => prev + 1)
  }

  // 处理模态框中的超级喜欢操作
  const handleModalSuperLike = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    console.log(`⭐ [模态框] 用户点击超级喜欢按钮 - 目标用户:`, user)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log(`📤 [模态框] 发送超级喜欢请求 - 目标用户ID: ${userId}`)

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: userId,
          action: 'super_like'
        })
      })

      console.log(`📡 [模态框] 超级喜欢API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [模态框] 超级喜欢API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [模态框] 超级喜欢匹配成功！与${user.name}形成双向匹配`)
            fetchMatchedUsers()
            alert(`🎉 恭喜！你的超级喜欢生效了，你和${user.name}匹配成功！`)
          } else {
            console.log(`⭐ [模态框] 超级喜欢请求已发送给${user.name}，等待对方回应`)
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            notification.innerHTML = `⭐ 已向${user.name}发送超级喜欢请求`
            document.body.appendChild(notification)
            setTimeout(() => {
              document.body.removeChild(notification)
            }, 3000)
          }
        } else {
          console.error('❌ [模态框] 超级喜欢API返回错误:', data.error)
          alert('操作失败: ' + data.error)
        }
      } else {
        console.error('❌ [模态框] 超级喜欢API请求失败')
        alert('请求失败，请重试')
      }
    } catch (error) {
      console.error('❌ [模态框] 处理超级喜欢失败:', error)
      alert('网络错误，请重试')
    }

    setCurrentIndex(prev => prev + 1)
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
                             <Link href="/" className="hover:opacity-80 transition-opacity">
                 <h1 className="text-xl font-bold text-red-500 flex items-center">
                   <Heart className="mr-2 text-red-500" size={24} />
                   ConnectEd Elite Social Club
                 </h1>
               </Link>
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

              {/* 浮动聊天按钮 */}
              <motion.button
                onClick={() => setShowChat(!showChat)}
                className="relative p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="浮动聊天窗口"
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
              </motion.button>

              {/* 性别相关功能按钮 */}
              {(currentUser?.gender === '女' || currentUser?.gender === 'female') && (
                <motion.button
                  onClick={() => router.push('/female-matches')}
                  className="relative p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="我的匹配 - 开始对话"
                >
                  <Heart size={20} />
                  {matchedUsers.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-white text-pink-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                    >
                      {matchedUsers.length}
                    </motion.span>
                  )}
                </motion.button>
              )}




              
              <button
                onClick={() => setShowProfile(true)}
                className="relative p-0 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors shadow-lg flex items-center justify-center w-11 h-11"
              >
                {currentUser?.avatar_url ? (
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={currentUser.avatar_url} 
                      alt={currentUser.name}
                      width={44}
                      height={44}
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
                  size={20} 
                  className={currentUser?.avatar_url ? 'hidden' : ''}
                />
              </button>

              {/* 桃花币入口 */}
              <motion.button
                onClick={() => router.push('/currency')}
                className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="桃花币系统"
              >
                <Flower size={24} />
              </motion.button>

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
      <div className="flex max-w-6xl mx-auto">
        {/* 左侧主要内容 */}
        <div className="flex-1 px-4 py-8 relative max-w-3xl">
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
                {/* 刷新按钮 */}
                <motion.button
                  onClick={() => {
                    fetchMatchedUsers()
                    fetchPendingMatchesCount()
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="刷新数据"
                >
                  <RefreshCw size={16} />
                </motion.button>
                
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
                    onClick={() => setShowChat(!showChat)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {showChat ? '隐藏聊天' : '开始聊天'}
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* 匹配用户预览 */}
            {matchedUsers.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {matchedUsers.slice(0, 5).map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex-shrink-0 w-20 text-center cursor-pointer p-1"
                    onClick={() => handleUserAvatarClick(user.id)}
                    whileHover={{ scale: 1.05 }}
                    style={{ transformOrigin: 'center' }}
                  >
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-2 relative overflow-visible">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        {user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600' ? (
                          <img 
                            src={user.photos[0]} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(`❌ 图片加载失败: ${user.name} - ${user.photos[0]}`)
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) {
                                fallback.style.display = 'flex'
                              }
                            }}
                            onLoad={() => {
                              console.log(`✅ 图片加载成功: ${user.name} - ${user.photos[0]}`)
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-red-600 font-medium text-lg"
                          style={{ display: (user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                        >
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-10"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium truncate">{user.name}</p>
                  </motion.div>
                ))}
                {matchedUsers.length > 5 && (
                  <motion.div
                    className="flex-shrink-0 w-20 text-center cursor-pointer p-1"
                    onClick={() => setShowChat(true)}
                    whileHover={{ scale: 1.05 }}
                    style={{ transformOrigin: 'center' }}
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

          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-4xl">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <UserCard user={user} onClick={handleUserCardClick} />
                </motion.div>
              ))}
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

        {/* 右侧用户头像列表 */}
        {matchedUsers.length > 0 && (
          <div className="hidden xl:block w-72 bg-white border-l border-gray-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">我的匹配</h3>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <MessageCircle size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {matchedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setInitialChatUserId(user.id)
                    setShowChat(true)
                  }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600' ? (
                        <img 
                          src={user.photos[0]} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) {
                              fallback.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-red-600 font-medium"
                        style={{ display: (user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                      >
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.location}</p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <MessageCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 待接受匹配面板 */}
      {showPendingMatches && (
        <PendingMatchesPanel
          onClose={() => setShowPendingMatches(false)}
          onMatchAccepted={handleMatchAccepted}
        />
      )}

      {/* 聊天面板组件 */}
      {showChat && (
        <StreamChatPanel
          matchedUsers={matchedUsers}
          initialUserId={initialChatUserId || undefined}
          isOpen={showChat}
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

             {/* 用户详情模态框 */}
       <UserDetailModal
         user={selectedUser}
         isOpen={showUserDetailModal}
         onClose={() => {
           setShowUserDetailModal(false)
           setSelectedUser(null)
         }}
         onLike={handleModalLike}
         onSuperLike={handleModalSuperLike}
       />

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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
} 