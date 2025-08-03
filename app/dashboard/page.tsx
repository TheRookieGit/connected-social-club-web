'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, User as UserIcon, Settings, LogOut, Star, MapPin, Calendar, Users, Badge, Clock, Flower, X, Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import useSWR from 'swr'
import UserCard from '@/components/UserCard'
import ProfileModal from '@/components/ProfileModal'
import PendingMatchesPanel from '@/components/PendingMatchesPanel'
import LocationDisplay from '@/components/LocationDisplay'
import { syncUserDataToLocalStorage } from '@/lib/hooks'
import { UserProfile } from '@/types/user'
import dynamic from 'next/dynamic'
import { shouldAutoRequestLocation, recordUserDenial } from '@/lib/locationPermission'

// 动态导入LinkedIn风格聊天组件，避免SSR问题
const LinkedInStyleChatPanel = dynamic(() => import('@/components/LinkedInStyleChatPanel'), {
  ssr: false,
  loading: () => <div>加载聊天中...</div>
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
  values_preferences?: string[]
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

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
            const formattedUsers: User[] = data.users.map((user: any) => {
              // 处理照片数据
              let photos: string[] = []
              
              // 调试信息
              console.log(`🔍 [前端] 用户 ${user.name} 的照片数据:`, {
                photos: user.photos,
                avatar_url: user.avatar_url,
                photosType: typeof user.photos,
                photosIsArray: Array.isArray(user.photos)
              })
              
              // 如果用户有photos字段且不为空
              if (user.photos && Array.isArray(user.photos) && user.photos.length > 0) {
                photos = user.photos
                console.log(`📸 [前端] 用户 ${user.name} 使用photos字段:`, photos)
              } else if (user.avatar_url) {
                // 如果没有photos但有avatar_url，使用avatar_url
                photos = [user.avatar_url]
                console.log(`🖼️ [前端] 用户 ${user.name} 使用avatar_url:`, photos)
              } else {
                // 如果都没有，使用占位符
                photos = ['/api/placeholder/400/600']
                console.log(`🚫 [前端] 用户 ${user.name} 使用占位符:`, photos)
              }
              
              console.log(`🔍 [前端] 用户 ${user.name} 的价值观偏好:`, user.values_preferences)
              console.log(`🔍 [前端] 用户 ${user.name} 的完整数据:`, user)
              return {
                id: user.id.toString(),
                name: user.name,
                age: calculateAge(user.birth_date),
                location: user.location || '未知',
                bio: user.bio || '这个人很神秘...',
                interests: user.interests || [],
                photos: photos,
                isOnline: user.is_online || false,
                values_preferences: user.values_preferences || []
              }
            })
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
  const handleLike = async (userId?: string) => {
    const targetUser = userId ? users.find(u => u.id === userId) : users[currentIndex]
    if (!targetUser) return

    console.log(`💖 [前端] 用户点击喜欢按钮 - 目标用户:`, targetUser)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [前端] 没有找到登录token')
        return
      }

      console.log(`📤 [前端] 发送喜欢请求 - 目标用户ID: ${targetUser.id}`)

      // 使用 user_matches API
      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: targetUser.id,
          action: 'like'
        })
      })

      console.log(`📡 [前端] user_matches API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [前端] user_matches API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [前端] 匹配成功！与${targetUser.name}形成双向匹配`)
            // 重新获取已匹配用户列表
            fetchMatchedUsers()
            alert(`🎉 恭喜！你和${targetUser.name}匹配成功了！`)
          } else {
            console.log(`💌 [前端] 喜欢请求已发送给${targetUser.name}，等待对方回应`)
            // 显示友好的提示信息
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-purple-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            notification.innerHTML = `💌 已向${targetUser.name}发送喜欢请求`
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

    // 如果是列表模式，从列表中移除该用户
    if (userId) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    } else {
    setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePass = async (userId?: string) => {
    const targetUser = userId ? users.find(u => u.id === userId) : users[currentIndex]
    if (!targetUser) return

    console.log(`👎 [前端] 用户点击跳过按钮 - 目标用户:`, targetUser)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
      console.log(`📤 [前端] 发送跳过请求 - 当前用户ID: ${currentUserId}, 目标用户ID: ${targetUser.id}`)

      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: targetUser.id,
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

    // 如果是列表模式，从列表中移除该用户
    if (userId) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    } else {
    setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSuperLike = async (userId?: string) => {
    const targetUser = userId ? users.find(u => u.id === userId) : users[currentIndex]
    if (!targetUser) return

    console.log(`⭐ [前端] 用户点击超级喜欢按钮 - 目标用户:`, targetUser)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log(`📤 [前端] 发送超级喜欢请求 - 目标用户ID: ${targetUser.id}`)

      // 使用 user_matches API 发送超级喜欢
      const response = await fetch('/api/user/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchedUserId: targetUser.id,
          action: 'super_like'
        })
      })

      console.log(`📡 [前端] 超级喜欢API响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log(`📨 [前端] 超级喜欢API响应数据:`, data)
        
        if (data.success) {
          if (data.isMatch) {
            console.log(`🎉 [前端] 超级喜欢匹配成功！与${targetUser.name}形成双向匹配`)
            // 重新获取已匹配用户列表
            fetchMatchedUsers()
            alert(`🎉 恭喜！你的超级喜欢生效了，你和${targetUser.name}匹配成功！`)
          } else {
            console.log(`⭐ [前端] 超级喜欢请求已发送给${targetUser.name}，等待对方回应`)
            // 显示友好的提示信息
            const notification = document.createElement('div')
            notification.className = 'fixed top-20 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            notification.innerHTML = `⭐ 已向${targetUser.name}发送超级喜欢请求`
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

    // 如果是列表模式，从列表中移除该用户
    if (userId) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    } else {
    setCurrentIndex(prev => prev + 1)
    }
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

  // 处理用户卡片点击，显示用户详情悬浮窗
  const handleUserCardClick = (user: User) => {
    console.log('用户卡片点击:', user)
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  // 花瓣特效函数
  const createPetalEffect = () => {
    const petals: HTMLElement[] = []
    const colors = ['#ff69b4', '#ff1493', '#ff69b4', '#ff1493', '#ff69b4']
    
    for (let i = 0; i < 8; i++) {
      const petal = document.createElement('div')
      petal.className = 'fixed pointer-events-none z-50'
      petal.style.cssText = `
        width: 20px;
        height: 20px;
        background: ${colors[i % colors.length]};
        border-radius: 50% 0 50% 50%;
        transform: rotate(${i * 45}deg);
        left: 50%;
        top: 50%;
        margin-left: -10px;
        margin-top: -10px;
        animation: petalFloat 2s ease-out forwards;
        animation-delay: ${i * 0.1}s;
      `
      document.body.appendChild(petal)
      petals.push(petal)
    }
    
    // 添加CSS动画
    if (!document.getElementById('petal-animation')) {
      const style = document.createElement('style')
      style.id = 'petal-animation'
      style.textContent = `
        @keyframes petalFloat {
          0% {
            transform: rotate(var(--rotation)) scale(0) translateY(0);
            opacity: 1;
          }
          50% {
            transform: rotate(calc(var(--rotation) + 180deg)) scale(1) translateY(-100px);
            opacity: 1;
          }
          100% {
            transform: rotate(calc(var(--rotation) + 360deg)) scale(0) translateY(-200px);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }
    
    // 清理花瓣
            setTimeout(() => {
      petals.forEach(petal => {
        if (petal.parentNode) {
          petal.parentNode.removeChild(petal)
        }
      })
            }, 3000)
          }

  // 价值观映射函数
  const getValueDisplayName = (valueId: string) => {
    const valueMap: { [key: string]: string } = {
      'kindness': '善良',
      'loyalty': '忠诚',
      'optimism': '乐观',
      'honesty': '诚实',
      'humor': '幽默',
      'intelligence': '智慧',
      'ambition': '野心',
      'creativity': '创造力',
      'empathy': '同理心',
      'patience': '耐心',
      'confidence': '自信',
      'adventure': '冒险精神',
      'stability': '稳定',
      'passion': '热情',
      'independence': '独立',
      'teamwork': '团队合作',
      'leadership': '领导力',
      'flexibility': '灵活性',
      'determination': '决心',
      'compassion': '同情心',
      'playfulness': '有趣',
      'sassiness': '俏皮',
      'romance': '浪漫',
      'communication': '沟通',
      'trust': '信任',
      'respect': '尊重',
      'understanding': '理解',
      'support': '支持',
      'growth': '成长',
      'fun': '乐趣',
      'excitement': '刺激',
      'peace': '平静',
      'harmony': '和谐',
      'balance': '平衡',
      'joy': '快乐',
      'love': '爱',
      'care': '关心',
      'warmth': '温暖',
      'gentleness': '温柔',
      'strength': '坚强',
      'courage': '勇气',
      'wisdom': '智慧',
      'maturity': '成熟',
      'playful': '有趣',
      'sassy': '俏皮',
      'openness': '开放'
    }
    
    return valueMap[valueId] || valueId
  }

  // 关闭用户详情悬浮窗
  const handleCloseUserDetail = () => {
    setShowUserDetail(false)
    setSelectedUser(null)
    setCurrentPhotoIndex(0) // 重置照片索引
    setShowPhotoModal(false) // 同时关闭图片大图悬浮窗
  }

  // 照片轮播控制函数
  const handlePreviousPhoto = () => {
    if (selectedUser && selectedUser.photos && selectedUser.photos.length > 1) {
      setCurrentPhotoIndex(prev => 
        prev === 0 ? selectedUser.photos.length - 1 : prev - 1
      )
    }
  }

  const handleNextPhoto = () => {
    if (selectedUser && selectedUser.photos && selectedUser.photos.length > 1) {
      setCurrentPhotoIndex(prev => 
        prev === selectedUser.photos.length - 1 ? 0 : prev + 1
      )
    }
  }

  // 图片点击处理函数
  const handlePhotoClick = () => {
    setShowPhotoModal(true)
  }

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false)
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

              {/* LinkedIn风格聊天浮窗按钮 */}
              <motion.button
                onClick={() => setShowChat(true)}
                className="relative p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="LinkedIn风格聊天浮窗"
              >
                <MessageCircle size={20} />
                {matchedUsers.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {matchedUsers.length}
                  </motion.span>
                )}
                {/* 新功能标识 */}
                <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                  className="absolute -top-2 -left-2 bg-green-500 text-white text-[8px] rounded-full px-1.5 py-0.5 font-bold"
                    >
                  新
                </motion.div>
                </motion.button>


              
              <button
                onClick={() => setShowProfile(true)}
                className="p-3 text-gray-600 hover:text-red-500 transition-colors flex items-center rounded-full hover:bg-gray-100"
              >
                {currentUser?.avatar_url ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-red-500 transition-colors">
                    <Image 
                      src={currentUser.avatar_url} 
                      alt={currentUser.name}
                      width={40}
                      height={40}
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

              {/* 重新进行注册流程按钮 */}
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token')
                    if (!token) {
                      alert('请先登录')
                      return
                    }
                  } catch (error) {
                    console.error('重新注册流程错误:', error)
                  }
                }}
                className="p-2 text-gray-600 hover:text-green-500 transition-colors"
                title="重新注册"
              >
                <Calendar size={24} />
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
        
        {/* 我的匹配概览区域 - 已隐藏 */}
        {false && (
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
              </div>
            </div>
            
            {/* 匹配用户预览 */}
            {matchedUsers.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {matchedUsers.slice(0, 5).map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex-shrink-0 w-20 text-center cursor-pointer"
                    onClick={() => handleUserAvatarClick(user.id)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                      <div className="w-full h-full rounded-full overflow-hidden">
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
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleUserCardClick(user)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    {/* 用户头像 */}
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                      {(() => {
                        const hasValidPhoto = user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600'
                        console.log(`🖼️ [前端] 用户 ${user.name} 图片显示检查:`, {
                          hasPhotos: !!user.photos,
                          photosLength: user.photos?.length,
                          firstPhoto: user.photos?.[0],
                          hasValidPhoto: hasValidPhoto
                        })
                        
                        return hasValidPhoto ? (
                          <img
                            src={user.photos[0]}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(`❌ [前端] 图片加载失败:`, user.photos[0])
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) {
                                fallback.style.display = 'flex'
                              }
                            }}
                            onLoad={() => {
                              console.log(`✅ [前端] 图片加载成功:`, user.photos[0])
                            }}
                          />
                        ) : null
                      })()}
                      <div 
                        className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400"
                        style={{ display: (user.photos && user.photos.length > 0 && user.photos[0] && user.photos[0] !== '/api/placeholder/400/600') ? 'none' : 'flex' }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      

                      

                    </div>
                  </div>
                  
                  {/* 用户信息 */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <div className="text-lg font-semibold text-gray-900">
                        {user.age}岁
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin size={16} className="mr-1" />
                      {user.location}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{user.bio}</p>
                    
                    {/* 兴趣标签 */}
                    {user.interests && user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.interests.slice(0, 3).map((interest, idx) => {
                          // 兴趣标签映射
                          const interestTags = [
                            { id: 'baking', name: '烘焙', emoji: '🍰' },
                            { id: 'lgbtq_rights', name: 'LGBTQ+', emoji: '🏳️‍🌈' },
                            { id: 'hiking', name: '徒步', emoji: '⛰️' },
                            { id: 'gardening', name: '园艺', emoji: '🌱' },
                            { id: 'rnb', name: '音乐', emoji: '🎵' },
                            { id: 'art', name: '艺术', emoji: '🎨' },
                            { id: 'writing', name: '写作', emoji: '📝' },
                            { id: 'country', name: '绘画', emoji: '🖼️' },
                            { id: 'skiing', name: '阅读', emoji: '📚' },
                            { id: 'museums', name: '博物馆', emoji: '🏛️' },
                            { id: 'vegetarian', name: '素食', emoji: '🥦' },
                            { id: 'horror', name: '电影', emoji: '📺' },
                            { id: 'dancing', name: '跳舞', emoji: '💃' },
                            { id: 'yoga', name: '瑜伽', emoji: '🧘' },
                            { id: 'dogs', name: '狗', emoji: '🐶' },
                            { id: 'crafts', name: '手工艺', emoji: '🧷' },
                            { id: 'festivals', name: '节日', emoji: '🎉' },
                            { id: 'tennis', name: '运动', emoji: '🎾' },
                            { id: 'cats', name: '猫', emoji: '🐱' },
                            { id: 'concerts', name: '音乐会', emoji: '🎟️' },
                            { id: 'foodie', name: '美食', emoji: '🍜' },
                            { id: 'exploring_cities', name: '旅游', emoji: '🏙️' },
                            { id: 'camping', name: '露营', emoji: '⛺' },
                            { id: 'wine', name: '葡萄酒', emoji: '🍷' },
                            { id: 'feminism', name: '女权主义', emoji: '💛' },
                            { id: 'coffee', name: '咖啡', emoji: '☕' },
                            { id: 'gaming', name: '游戏', emoji: '🎮' }
                          ]
                          
                          const interestTag = interestTags.find(tag => tag.id === interest)
                          let displayName = interest
                          
                          if (interestTag) {
                            // 如果找到ID映射，使用emoji + 中文名称
                            displayName = `${interestTag.emoji} ${interestTag.name}`
                          } else {
                            // 如果没有找到ID映射，检查是否已经是中文文本
                            const chineseInterestMap: { [key: string]: string } = {
                              '编程': '💻 编程',
                              '管理': '📊 管理',
                              '旅行': '✈️ 旅行',
                              '摄影': '📸 摄影',
                              '音乐': '🎵 音乐',
                              '游戏': '🎮 游戏',
                              '咖啡': '☕ 咖啡',
                              '美食': '🍜 美食',
                              '运动': '🏅 运动',
                              '阅读': '📚 阅读',
                              '写作': '✍️ 写作',
                              '艺术': '🎨 艺术',
                              '电影': '🎬 电影',
                              '跳舞': '💃 跳舞',
                              '瑜伽': '🧘 瑜伽',
                              '徒步': '⛰️ 徒步',
                              '露营': '⛺ 露营',
                              '园艺': '🌱 园艺',
                              '手工艺': '🧷 手工艺',
                              '节日': '🎉 节日',
                              '音乐会': '🎟️ 音乐会',
                              '葡萄酒': '🍷 葡萄酒',
                              '女权主义': '♀️ 女权主义',
                              '烘焙': '🍰 烘焙',
                              '素食': '🥦 素食',
                              '博物馆': '🏛️ 博物馆',
                              '绘画': '🖼️ 绘画',
                              '狗': '🐶 狗',
                              '猫': '🐱 猫'
                            }
                            
                            if (chineseInterestMap[interest]) {
                              displayName = chineseInterestMap[interest]
                            }
                          }
                          
                          return (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full"
                            >
                              {displayName}
                            </span>
                          )
                        })}
                        {user.interests.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{user.interests.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    打开聊天浮窗
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

      {/* LinkedIn风格聊天浮窗 */}
      {showChat && (
        <LinkedInStyleChatPanel
          matchedUsers={matchedUsers}
          onClose={() => {
            setShowChat(false)
            setInitialChatUserId(null) // 清理初始用户ID
          }}
          initialUserId={initialChatUserId || undefined}
          isOpen={showChat}
          position="bottom-right"
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

      {/* 用户详情悬浮窗 */}
      {showUserDetail && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseUserDetail}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="relative">
              {/* 用户照片轮播 */}
              <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden rounded-t-2xl">
                {selectedUser.photos && selectedUser.photos.length > 0 && selectedUser.photos[currentPhotoIndex] && selectedUser.photos[currentPhotoIndex] !== '/api/placeholder/400/600' ? (
                  <img
                    src={selectedUser.photos[currentPhotoIndex]}
                    alt={`${selectedUser.name} 照片 ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300 cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={handlePhotoClick}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-400">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                
                {/* 照片轮播控制按钮 */}
                {selectedUser.photos && selectedUser.photos.length > 1 && (
                  <>
                    {/* 上一张按钮 */}
                    <button
                      onClick={handlePreviousPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all z-20"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    
                    {/* 下一张按钮 */}
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all z-20"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                    
                    {/* 照片指示器 */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                      {selectedUser.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentPhotoIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {/* 关闭按钮 */}
                <button
                  onClick={handleCloseUserDetail}
                  className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all z-30"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6">
              {/* 基本信息 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <div className="text-xl font-semibold text-gray-700">{selectedUser.age}岁</div>
                </div>
                
                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin size={18} className="mr-2" />
                  <span>{selectedUser.location}</span>
                </div>
                
                {selectedUser.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedUser.bio}</p>
                )}
              </div>

              {/* 兴趣爱好 */}
              {selectedUser.interests && selectedUser.interests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart size={20} className="mr-2 text-red-500" />
                    兴趣爱好
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.interests.map((interest, idx) => {
                      // 兴趣标签映射
                      const interestTags = [
                        { id: 'baking', name: '烘焙', emoji: '🍰' },
                        { id: 'lgbtq_rights', name: 'LGBTQ+', emoji: '🏳️‍🌈' },
                        { id: 'hiking', name: '徒步', emoji: '⛰️' },
                        { id: 'gardening', name: '园艺', emoji: '🌱' },
                        { id: 'rnb', name: '音乐', emoji: '🎵' },
                        { id: 'art', name: '艺术', emoji: '🎨' },
                        { id: 'writing', name: '写作', emoji: '📝' },
                        { id: 'country', name: '绘画', emoji: '🖼️' },
                        { id: 'skiing', name: '阅读', emoji: '📚' },
                        { id: 'museums', name: '博物馆', emoji: '🏛️' },
                        { id: 'vegetarian', name: '素食', emoji: '🥦' },
                        { id: 'horror', name: '电影', emoji: '📺' },
                        { id: 'dancing', name: '跳舞', emoji: '💃' },
                        { id: 'yoga', name: '瑜伽', emoji: '🧘' },
                        { id: 'dogs', name: '狗', emoji: '🐶' },
                        { id: 'crafts', name: '手工艺', emoji: '🧷' },
                        { id: 'festivals', name: '节日', emoji: '🎉' },
                        { id: 'tennis', name: '运动', emoji: '🎾' },
                        { id: 'cats', name: '猫', emoji: '🐱' },
                        { id: 'concerts', name: '音乐会', emoji: '🎟️' },
                        { id: 'foodie', name: '美食', emoji: '🍜' },
                        { id: 'exploring_cities', name: '旅游', emoji: '🏙️' },
                        { id: 'camping', name: '露营', emoji: '⛺' },
                        { id: 'wine', name: '葡萄酒', emoji: '🍷' },
                        { id: 'feminism', name: '女权主义', emoji: '💛' },
                        { id: 'coffee', name: '咖啡', emoji: '☕' },
                        { id: 'gaming', name: '游戏', emoji: '🎮' }
                      ]
                      
                      const interestTag = interestTags.find(tag => tag.id === interest)
                      let displayName = interest
                      
                      if (interestTag) {
                        displayName = `${interestTag.emoji} ${interestTag.name}`
                      } else {
                        // 检查是否已经是中文文本
                        const chineseInterestMap: { [key: string]: string } = {
                          '编程': '💻 编程',
                          '管理': '📊 管理',
                          '旅行': '✈️ 旅行',
                          '摄影': '📸 摄影',
                          '音乐': '🎵 音乐',
                          '游戏': '🎮 游戏',
                          '咖啡': '☕ 咖啡',
                          '美食': '🍜 美食',
                          '运动': '🏅 运动',
                          '阅读': '📚 阅读',
                          '写作': '✍️ 写作',
                          '艺术': '🎨 艺术',
                          '电影': '🎬 电影',
                          '跳舞': '💃 跳舞',
                          '瑜伽': '🧘 瑜伽',
                          '徒步': '⛰️ 徒步',
                          '露营': '⛺ 露营',
                          '园艺': '🌱 园艺',
                          '手工艺': '🧷 手工艺',
                          '节日': '🎉 节日',
                          '音乐会': '🎟️ 音乐会',
                          '葡萄酒': '🍷 葡萄酒',
                          '女权主义': '♀️ 女权主义',
                          '烘焙': '🍰 烘焙',
                          '素食': '🥦 素食',
                          '博物馆': '🏛️ 博物馆',
                          '绘画': '🖼️ 绘画',
                          '狗': '🐶 狗',
                          '猫': '🐱 猫'
                        }
                        
                        if (chineseInterestMap[interest]) {
                          displayName = chineseInterestMap[interest]
                        }
                      }
                      
                      return (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-pink-100 text-pink-600 text-sm rounded-full font-medium"
                        >
                          {displayName}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 生活方式 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity size={20} className="mr-2 text-blue-500" />
                  生活方式
                </h3>
                {/* 有待完善提示 */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center text-yellow-700 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span>有待完善</span>
                  </div>
                  <p className="text-yellow-600 text-xs mt-1">
                    用户尚未完成生活方式信息的填写
                  </p>
                </div>
              </div>

              {/* 我希望你是... */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Star size={20} className="mr-2 text-yellow-500" />
                  我希望你是...
                </h3>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedUser.name} 在寻找具有以下品质的人：
                  </p>
                  {selectedUser.values_preferences && selectedUser.values_preferences.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {selectedUser.values_preferences.map((value, index) => {
                        const colors = ['bg-pink-400', 'bg-purple-400', 'bg-blue-400']
                        const displayName = getValueDisplayName(value)
                        console.log(`🎯 [前端] 价值观映射: ${value} -> ${displayName}`)
                        return (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className={`w-2 h-2 ${colors[index % colors.length]} rounded-full mr-3`}></div>
                            {displayName}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                        有共同兴趣爱好的伙伴
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                        能够深入交流的朋友
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        愿意分享生活的人
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleCloseUserDetail()
                    handleSuperLike(selectedUser.id)
                    // 触发花瓣特效
                    createPetalEffect()
                  }}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Flower size={20} />
                  <span>超级喜欢</span>
                </button>
                <button
                  onClick={() => {
                    handleCloseUserDetail()
                    handleLike(selectedUser.id)
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  喜欢
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 图片大图悬浮窗 */}
      {showPhotoModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={handleClosePhotoModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 大图显示 */}
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedUser.photos && selectedUser.photos.length > 0 && selectedUser.photos[currentPhotoIndex] && selectedUser.photos[currentPhotoIndex] !== '/api/placeholder/400/600' ? (
                <img
                  src={selectedUser.photos[currentPhotoIndex]}
                  alt={`${selectedUser.name} 照片 ${currentPhotoIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-gray-400 bg-white rounded-lg">
                  {selectedUser.name.charAt(0)}
                </div>
              )}
              
              {/* 照片轮播控制按钮 */}
              {selectedUser.photos && selectedUser.photos.length > 1 && (
                <>
                  {/* 上一张按钮 */}
                  <button
                    onClick={handlePreviousPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all z-20 shadow-lg"
                  >
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                  
                  {/* 下一张按钮 */}
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all z-20 shadow-lg"
                  >
                    <ChevronRight size={24} className="text-gray-700" />
                  </button>
                  
                  {/* 照片指示器 */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                    {selectedUser.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentPhotoIndex 
                            ? 'bg-white scale-125' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* 照片计数 */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm z-20">
                    {currentPhotoIndex + 1} / {selectedUser.photos.length}
                  </div>
                </>
              )}
              
              {/* 关闭按钮 */}
              <button
                onClick={handleClosePhotoModal}
                className="absolute top-6 right-6 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all z-30"
              >
                <X size={24} className="text-white" />
              </button>
              
              {/* 用户信息 */}
              <div className="absolute bottom-6 left-6 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm z-20">
                <div className="font-semibold">{selectedUser.name}</div>
                <div className="text-gray-300">{selectedUser.age}岁 • {selectedUser.location}</div>
              </div>
            </div>
          </motion.div>
        </div>
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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
} 