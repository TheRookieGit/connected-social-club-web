'use client'

import { useState } from 'react'
import { MapPin, Calendar, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface UserCardProps {
  user: User
  onClick?: (user: User) => void
}

export default function UserCard({ user, onClick }: UserCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const router = useRouter()

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

  const nextPhoto = () => {
    if (!user.photos || user.photos.length <= 1) return
    setCurrentPhotoIndex((prev) => 
      prev === user.photos.length - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    if (!user.photos || user.photos.length <= 1) return
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? user.photos.length - 1 : prev - 1
    )
  }

  // 获取兴趣标签的显示名称
  const getInterestDisplayName = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    return tag ? `${tag.emoji} ${tag.name}` : interestId
  }

  // 处理卡片点击
  const handleCardClick = () => {
    if (onClick) {
      onClick(user)
    } else {
      router.push(`/user-profile/${user.id}`)
    }
  }

  return (
    <div 
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden card-hover cursor-pointer transform transition-transform hover:scale-105 w-80 mx-auto"
      onClick={handleCardClick}
    >
      {/* 照片区域 */}
      <div className="relative h-96 bg-gradient-to-br from-red-100 to-pink-100">
        {/* 显示用户头像或照片 */}
        {user.photos && user.photos.length > 0 && user.photos[currentPhotoIndex] && user.photos[currentPhotoIndex] !== '/api/placeholder/400/600' ? (
          <img 
            src={user.photos[currentPhotoIndex]} 
            alt={user.name}
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
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        
        {/* 照片指示器 */}
        {user.photos && user.photos.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex space-x-2">
              {user.photos.map((_, index) => (
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
        {user.photos && user.photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextPhoto()
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ›
            </button>
          </>
        )}

        {/* 在线状态 */}
        <div className="absolute top-4 right-4 z-20">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            user.isOnline ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              user.isOnline ? 'bg-white' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm font-medium">
              {user.isOnline ? '在线' : '离线'}
            </span>
          </div>
        </div>

        {/* 用户信息覆盖层 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}, {user.age}
              </h2>
              <div className="flex items-center space-x-2 text-white/90 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user.location}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                onClick={async (e) => {
                  e.stopPropagation()
                  
                  try {
                    const token = localStorage.getItem('token')
                    if (!token) {
                      alert('请先登录')
                      return
                    }

                    const response = await fetch('/api/user/matches', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        matchedUserId: parseInt(user.id),
                        action: 'like'
                      })
                    })

                    if (response.ok) {
                      const data = await response.json()
                      if (data.success) {
                        if (data.isMatch) {
                          alert(`🎉 恭喜！你和${user.name}匹配成功了！`)
                        } else {
                          alert(`💌 已向${user.name}发送喜欢请求`)
                        }
                      } else {
                        alert('操作失败: ' + data.error)
                      }
                    } else {
                      alert('请求失败，请重试')
                    }
                  } catch (error) {
                    console.error('处理喜欢操作失败:', error)
                    alert('网络错误，请重试')
                  }
                }}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="p-6">
        <p className="text-gray-700 mb-4 leading-relaxed">
          {user.bio}
        </p>

        {/* 兴趣标签 */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">兴趣爱好</h4>
          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
              >
                {getInterestDisplayName(interest)}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                +{user.interests.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{user.age}岁</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 