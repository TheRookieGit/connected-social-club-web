'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Heart, MessageCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  name: string
  age: number
  gender: string
  location: string
  bio: string
  occupation: string | null
  education: string | null
  relationship_status: string | null
  height: number | null
  weight: number | null
  ethnicity: string | null
  religion: string | null
  employer: string | null
  school: string | null
  degree: string | null
  values_preferences: string[] | null
  personality_type: string | null
  hometown: string | null
  languages: string[] | null
  family_plans: string | null
  has_kids: boolean | null
  marital_status: string | null
  exercise_frequency: string | null
  smoking_status: string | null
  drinking_status: string | null
  dating_style: string | null
  avatar_url: string | null
  photos: string[]
  interests: string[]
  isOnline: boolean
  lastSeen: string
  matchScore?: number
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/')
          return
        }

        const response = await fetch(`/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('个人资料页面 - API响应:', data)
          if (data.success) {
            console.log('个人资料页面 - 设置profile:', data.profile)
            setProfile(data.profile)
          } else {
            console.error('获取用户资料失败:', data.error)
          }
        } else {
          console.error('获取用户资料请求失败')
        }
      } catch (error) {
        console.error('获取用户资料错误:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
      checkLikeStatus()
    }
  }, [userId, router])

  // 检查是否已经喜欢该用户
  const checkLikeStatus = async () => {
    if (!userId) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('检查喜欢状态 - 用户ID:', userId)
      
      const response = await fetch(`/api/user/check-like/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('检查喜欢状态 - API响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('检查喜欢状态 - API响应数据:', data)
        setIsLiked(data.isLiked)
        console.log('设置喜欢状态为:', data.isLiked)
      } else {
        console.log('API失败，使用本地存储')
        // 如果API失败，暂时使用本地存储来模拟
        const likedUsers = JSON.parse(localStorage.getItem('likedUsers') || '[]')
        console.log('本地存储的喜欢用户:', likedUsers)
        const isUserLiked = likedUsers.includes(userId)
        console.log('用户是否在本地喜欢列表中:', isUserLiked)
        setIsLiked(isUserLiked)
      }
    } catch (error) {
      console.error('检查喜欢状态时出错:', error)
      // 如果API失败，暂时使用本地存储来模拟
      const likedUsers = JSON.parse(localStorage.getItem('likedUsers') || '[]')
      console.log('错误时使用本地存储，喜欢用户:', likedUsers)
      const isUserLiked = likedUsers.includes(userId)
      console.log('用户是否在本地喜欢列表中:', isUserLiked)
      setIsLiked(isUserLiked)
    }
  }

  const getInterestDisplayName = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    return tag ? `${tag.emoji} ${tag.name}` : interestId
  }

  // 字段值翻译函数
  const translateFieldValue = (field: string, value: string | null) => {
    if (!value) return '未设置'
    
    const translations: { [key: string]: { [key: string]: string } } = {
      gender: {
        'male': '男',
        'female': '女',
        'other': '其他'
      },
      relationship_status: {
        'single': '单身',
        'married': '已婚',
        'divorced': '离异',
        'widowed': '丧偶',
        'separated': '分居'
      },
      marital_status: {
        'single': '单身',
        'married': '已婚',
        'divorced': '离异',
        'widowed': '丧偶',
        'separated': '分居'
      },
      family_plans: {
        'wants_kids': '想要孩子',
        'open_to_kids': '对要孩子持开放态度',
        'no_kids': '不想要孩子',
        'has_kids': '已有孩子'
      },
      dating_style: {
        'casual': '随意约会',
        'serious': '认真恋爱',
        'marriage_minded': '以结婚为目的',
        'friends_first': '先做朋友'
      },
      smoking_status: {
        'never': '从不吸烟',
        'occasionally': '偶尔吸烟',
        'regularly': '经常吸烟',
        'trying_to_quit': '正在戒烟',
        'no_smoke': '不吸烟'
      },
      drinking_status: {
        'never': '从不饮酒',
        'occasionally': '偶尔饮酒',
        'regularly': '经常饮酒',
        'social_only': '只在社交场合饮酒',
        'no_drink': '不饮酒'
      },
      exercise_frequency: {
        'daily': '每天',
        'weekly': '每周',
        'monthly': '每月',
        'rarely': '很少',
        'never': '从不'
      },
      religion: {
        'christianity': '基督教',
        'islam': '伊斯兰教',
        'buddhism': '佛教',
        'hinduism': '印度教',
        'judaism': '犹太教',
        'atheism': '无神论',
        'agnosticism': '不可知论',
        'other': '其他',
        'no_religion': '无宗教信仰'
      },
      ethnicity: {
        'asian': '亚洲人',
        'caucasian': '白种人',
        'african': '非洲人',
        'hispanic': '西班牙裔',
        'middle_eastern': '中东人',
        'mixed': '混血',
        'other': '其他'
      },
      values: {
        'kindness': '善良',
        'loyalty': '忠诚',
        'optimism': '乐观',
        'honesty': '诚实',
        'respect': '尊重',
        'compassion': '同情心',
        'integrity': '正直',
        'humor': '幽默',
        'adventure': '冒险',
        'creativity': '创造力',
        'intelligence': '智慧',
        'ambition': '野心',
        'patience': '耐心',
        'generosity': '慷慨',
        'courage': '勇气'
      }
    }
    
    return translations[field]?.[value] || value
  }

  const nextPhoto = () => {
    if (profile && profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => 
        prev === profile.photos.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevPhoto = () => {
    if (profile && profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? profile.photos.length - 1 : prev - 1
      )
    }
  }

  const handleLike = async () => {
    if (!userId || likeLoading) return
    
    console.log('handleLike 被调用 - 当前状态:', { userId, isLiked, likeLoading })
    
    try {
      setLikeLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      // 尝试使用API
      try {
        console.log('尝试API调用:', `${isLiked ? 'unlike' : 'like'}/${userId}`)
        const response = await fetch(`/api/user/${isLiked ? 'unlike' : 'like'}/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('API响应状态:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('API响应数据:', data)
          if (data.success) {
            const newLikeStatus = !isLiked
            console.log('API成功，设置新状态:', newLikeStatus)
            setIsLiked(newLikeStatus)
            console.log(isLiked ? '取消喜欢用户:' : '喜欢用户:', profile?.name)
            return
          }
        }
      } catch (apiError) {
        console.error('API调用失败，使用本地存储:', apiError)
      }

      // 如果API失败，使用本地存储作为后备
      console.log('使用本地存储作为后备')
      const likedUsers = JSON.parse(localStorage.getItem('likedUsers') || '[]')
      console.log('当前本地存储的喜欢用户:', likedUsers)
      
      if (isLiked) {
        // 取消喜欢
        const updatedLikedUsers = likedUsers.filter((id: string) => id !== userId)
        localStorage.setItem('likedUsers', JSON.stringify(updatedLikedUsers))
        console.log('取消喜欢，更新本地存储:', updatedLikedUsers)
        setIsLiked(false)
        console.log('取消喜欢用户:', profile?.name)
      } else {
        // 喜欢
        likedUsers.push(userId)
        localStorage.setItem('likedUsers', JSON.stringify(likedUsers))
        console.log('喜欢，更新本地存储:', likedUsers)
        setIsLiked(true)
        console.log('喜欢用户:', profile?.name)
      }
    } catch (error) {
      console.error('喜欢操作时出错:', error)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleMessage = () => {
    // 跳转到聊天页面并指定用户ID
    router.push(`/dashboard?showChat=true&userId=${profile?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">用户不存在</h1>
          <button
            onClick={() => router.back()}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{profile.name} 的个人资料</h1>
            <div className="w-20"></div> {/* 占位符保持居中 */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* 照片区域 */}
          <div className="relative h-96 bg-gradient-to-br from-red-100 to-pink-100">
            {/* 显示用户头像或照片 */}
            {(() => {
              // 调试信息
              console.log('个人资料页面 - 照片数据:', {
                photos: profile.photos,
                currentPhotoIndex,
                avatar_url: profile.avatar_url,
                currentPhoto: profile.photos?.[currentPhotoIndex]
              })
              
              // 优先使用photos数组中的照片
              let photoUrl = null
              if (profile.photos && profile.photos.length > 0 && profile.photos[currentPhotoIndex]) {
                photoUrl = profile.photos[currentPhotoIndex]
              } else if (profile.avatar_url) {
                // 如果没有photos，使用avatar_url
                photoUrl = profile.avatar_url
              }
              
              // 过滤掉占位符URL
              if (photoUrl && photoUrl !== '/api/placeholder/400/600' && photoUrl !== 'null' && photoUrl !== '') {
                return (
                  <img 
                    src={photoUrl} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('图片加载失败:', photoUrl)
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                      // 显示fallback
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                )
              }
              
              // 如果没有有效照片，显示用户首字母
              return (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl font-bold text-red-300">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            })()}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
            
            {/* 照片指示器 */}
            {profile.photos.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="flex space-x-2">
                  {profile.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* 照片切换按钮 */}
            {profile.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ›
                </button>
              </>
            )}

            {/* 在线状态 */}
            <div className="absolute top-4 right-4 z-20">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                profile.isOnline ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  profile.isOnline ? 'bg-white' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm font-medium">
                  {profile.isOnline ? '在线' : '离线'}
                </span>
              </div>
            </div>

            {/* 用户信息覆盖层 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {profile.name}, {profile.age}
                  </h2>
                  <div className="flex items-center space-x-2 text-white/90 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleLike}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="p-8">
            {/* 个人简介 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">个人简介</h3>
              <p className="text-gray-700 leading-relaxed">
                {profile.bio || '这个人很神秘...'}
              </p>
            </div>

            {/* 兴趣标签 */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">兴趣爱好</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-full"
                    >
                      {getInterestDisplayName(interest)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基础信息 */}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">年龄</p>
                  <p className="font-medium text-gray-900">{profile.age}岁</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">位置</p>
                  <p className="font-medium text-gray-900">{profile.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">性别</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('gender', profile.gender)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">身高</p>
                  <p className="font-medium text-gray-900">{profile.height ? `${profile.height}cm` : '未设置'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">体重</p>
                  <p className="font-medium text-gray-900">{profile.weight ? `${profile.weight}kg` : '未设置'}</p>
                </div>
              </div>


              {/* 教育和工作 */}
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">雇主</p>
                  <p className="font-medium text-gray-900">{profile.employer || '未设置'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">职业</p>
                  <p className="font-medium text-gray-900">{profile.occupation || '未设置'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">学校</p>
                  <p className="font-medium text-gray-900">{profile.school || '未设置'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">学位</p>
                  <p className="font-medium text-gray-900">{profile.degree || '未设置'}</p>
                </div>
              </div>

              {/* 个人状态 */}
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">感情状态</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('relationship_status', profile.relationship_status)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">婚姻状态</p>
                  <p className="font-medium text-gray-900">{profile.marital_status || '未设置'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">家庭计划</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('family_plans', profile.family_plans)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">孩子</p>
                  <p className="font-medium text-gray-900">
                    {profile.has_kids === null ? '未设置' : (profile.has_kids ? '有孩子' : '没有孩子')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">约会目的</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('dating_style', profile.dating_style)}</p>
                </div>
              </div>

              {/* 文化和背景 */}
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">民族</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('ethnicity', profile.ethnicity)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">宗教信仰</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('religion', profile.religion)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">语言</p>
                  <p className="font-medium text-gray-900">
                    {profile.languages && profile.languages.length > 0 ? profile.languages.join(', ') : '未设置'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">家乡</p>
                  <p className="font-medium text-gray-900">{profile.hometown || '未设置'}</p>
                </div>
              </div>

              {/* 生活习惯 */}
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">吸烟</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('smoking_status', profile.smoking_status)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">饮酒</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('drinking_status', profile.drinking_status)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">运动频率</p>
                  <p className="font-medium text-gray-900">{translateFieldValue('exercise_frequency', profile.exercise_frequency)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">性格类型</p>
                  <p className="font-medium text-gray-900">{profile.personality_type || '未设置'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">价值观</p>
                  <p className="font-medium text-gray-900">
                    {profile.values_preferences && profile.values_preferences.length > 0 
                      ? profile.values_preferences.map(value => translateFieldValue('values', value)).join(', ') 
                      : '未设置'}
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              {/* 调试信息 */}
              {console.log('渲染按钮 - 当前状态:', { isLiked, likeLoading, userId })}
              <motion.button
                whileHover={{ scale: isLiked ? 1 : 1.05 }}
                whileTap={{ scale: isLiked ? 1 : 0.95 }}
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-colors ${
                  isLiked 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {likeLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                )}
                <span>{likeLoading ? '处理中...' : (isLiked ? '已喜欢' : '喜欢')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMessage}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <MessageCircle size={20} />
                <span>发送消息</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 