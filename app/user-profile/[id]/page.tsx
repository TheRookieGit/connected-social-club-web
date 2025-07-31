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
          if (data.success) {
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
    }
  }, [userId, router])

  const getInterestDisplayName = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    return tag ? `${tag.emoji} ${tag.name}` : interestId
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
    // 实现喜欢功能
    console.log('喜欢用户:', profile?.name)
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
            {profile.photos && profile.photos.length > 0 && profile.photos[currentPhotoIndex] && profile.photos[currentPhotoIndex] !== '/api/placeholder/400/600' ? (
              <img 
                src={profile.photos[currentPhotoIndex]} 
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              // 如果没有照片，显示用户首字母
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-bold text-red-300">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
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
              {profile.occupation && (
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">职业</p>
                    <p className="font-medium text-gray-900">{profile.occupation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <Heart size={20} />
                <span>喜欢</span>
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