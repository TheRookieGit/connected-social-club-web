'use client'

import React, { useState, useEffect } from 'react'
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
  const [validPhotos, setValidPhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  useEffect(() => {
    const validated = validatePhotos(user.photos)
    setValidPhotos(validated)
    setIsLoading(true)
  }, [user.photos])

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



  // 获取兴趣标签的显示名称
  const getInterestDisplayName = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    
    if (tag) {
      // 如果找到ID映射，使用emoji + 中文名称
      return `${tag.emoji} ${tag.name}`
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
      
      if (chineseInterestMap[interestId]) {
        return chineseInterestMap[interestId]
      }
      
      // 如果都不是，返回原始文本
      return interestId
    }
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
      <div className="relative h-64 bg-gradient-to-br from-red-100 to-pink-100 overflow-hidden">
        {/* 显示用户头像或照片 */}
        {validPhotos && validPhotos.length > 0 && validPhotos[0] ? (
          <>
            <img 
              key={`${user.id}-${validPhotos[0]}`}
              src={validPhotos[0]}
              alt={`${user.name}的照片`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsLoading(false)}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
                setIsLoading(false)
                
                // 从有效照片数组中移除加载失败的照片
                setValidPhotos(prev => prev.filter(photo => photo !== validPhotos[0]))
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            )}
          </>
        ) : (
          // 如果没有照片，显示用户首字母
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl font-bold text-red-300">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        






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