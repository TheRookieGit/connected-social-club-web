'use client'

import React, { useState } from 'react'
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
  const [validPhotos, setValidPhotos] = useState<string[]>([])
  const router = useRouter()

  // 验证和过滤照片
  const validatePhotos = (photos: string[]) => {
    if (!photos || !Array.isArray(photos)) return []
    
    return photos.filter(photo => {
      return photo && 
             photo !== null && 
             photo !== undefined && 
             photo !== '' && 
             photo !== '/api/placeholder/400/600' &&
             !photo.includes('placeholder')
    })
  }

  // 当用户数据更新时，重新验证照片
  React.useEffect(() => {
    const validated = validatePhotos(user.photos)
    setValidPhotos(validated)
    // 如果当前索引超出有效照片范围，重置为0
    if (currentPhotoIndex >= validated.length) {
      setCurrentPhotoIndex(0)
    }
  }, [user.photos, currentPhotoIndex])

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
    if (!validPhotos || validPhotos.length <= 1) return
    setCurrentPhotoIndex((prev) => 
      prev === validPhotos.length - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    if (!validPhotos || validPhotos.length <= 1) return
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? validPhotos.length - 1 : prev - 1
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
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden card-hover cursor-pointer transform transition-transform hover:scale-105 w-full max-w-sm"
      onClick={handleCardClick}
    >
      {/* 照片区域 */}
      <div className="relative h-64 bg-gradient-to-br from-red-100 to-pink-100">
        {/* 显示用户头像或照片 */}
        {validPhotos && validPhotos.length > 0 && validPhotos[currentPhotoIndex] ? (
          <img 
            key={`${user.id}-${currentPhotoIndex}-${validPhotos[currentPhotoIndex]}`}
            src={validPhotos[currentPhotoIndex]}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
              
              // 从有效照片数组中移除加载失败的照片
              setValidPhotos(prev => {
                const newPhotos = prev.filter((_, index) => index !== currentPhotoIndex)
                // 如果当前索引超出范围，重置为0
                if (currentPhotoIndex >= newPhotos.length && newPhotos.length > 0) {
                  setCurrentPhotoIndex(0)
                }
                return newPhotos
              })
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
        {validPhotos && validPhotos.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex space-x-2">
              {validPhotos.map((_, index) => (
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
        {validPhotos && validPhotos.length > 1 && (
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



        {/* 用户信息覆盖层 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                {user.name}, {user.age}
              </h2>
              <div className="flex items-center space-x-2 text-white/90">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{user.location}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
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
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="p-4">
        <p className="text-gray-700 mb-3 leading-relaxed text-sm line-clamp-2">
          {user.bio}
        </p>

        {/* 兴趣标签 */}
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-900 mb-1">兴趣爱好</h4>
          <div className="flex flex-wrap gap-1">
            {user.interests.slice(0, 2).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
              >
                {getInterestDisplayName(interest)}
              </span>
            ))}
            {user.interests.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{user.interests.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{user.age}岁</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{user.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 