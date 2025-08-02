'use client'

import { useState } from 'react'
import { MapPin, Calendar, Heart, Star, X, Briefcase, GraduationCap, Users, Languages, Baby, Cigarette, Wine, Target } from 'lucide-react'
import { motion } from 'framer-motion'

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

interface UserDetailModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onLike: (userId: string) => void
  onSuperLike: (userId: string) => void
}

export default function UserDetailModal({ 
  user, 
  isOpen, 
  onClose, 
  onLike, 
  onSuperLike 
}: UserDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  if (!user || !isOpen) return null

  // 调试信息：打印用户数据
  console.log('UserDetailModal - 接收到的用户数据:', user)

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
    setCurrentPhotoIndex((prev) => 
      prev === user.photos.length - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? user.photos.length - 1 : prev - 1
    )
  }

  // 获取兴趣标签的显示名称
  const getInterestDisplayName = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    return tag ? `${tag.emoji} ${tag.name}` : interestId
  }

  const handleLike = () => {
    onLike(user.id)
    onClose()
  }

  const handleSuperLike = () => {
    onSuperLike(user.id)
    onClose()
  }

  // 渲染信息项
  const renderInfoItem = (icon: React.ReactNode, label: string, value: string | number | null | undefined) => {
    if (!value) return null
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        {icon}
        <span className="font-medium">{label}:</span>
        <span>{value}</span>
      </div>
    )
  }

  // 渲染标签列表
  const renderTags = (label: string, tags: string[] | null | undefined) => {
    if (!tags || tags.length === 0) return null
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">{label}</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 照片区域 */}
        <div className="relative h-80 bg-gradient-to-br from-red-100 to-pink-100">
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
              <span className="text-6xl font-bold text-red-300">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
          
          {/* 照片指示器 */}
          {user.photos.length > 1 && (
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
          {user.photos.length > 1 && (
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
                <div className="flex items-center space-x-2 text-white/90">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{user.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="p-6">
          {/* 个人简介 */}
          {user.bio && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">个人简介</h4>
              <p className="text-gray-700 leading-relaxed text-sm">
                {user.bio}
              </p>
            </div>
          )}

          {/* 基本信息 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
            <div className="space-y-2">
              {renderInfoItem(<Calendar className="h-4 w-4" />, "年龄", `${user.age}岁`)}
              {renderInfoItem(<MapPin className="h-4 w-4" />, "位置", user.location)}
              {renderInfoItem(<Briefcase className="h-4 w-4" />, "职业", user.occupation)}
              {renderInfoItem(<GraduationCap className="h-4 w-4" />, "教育", user.education)}
              {user.school && renderInfoItem(<GraduationCap className="h-4 w-4" />, "学校", user.school)}
              {user.degree && renderInfoItem(<GraduationCap className="h-4 w-4" />, "学位", user.degree)}
              {user.employer && renderInfoItem(<Briefcase className="h-4 w-4" />, "雇主", user.employer)}
              {user.height && renderInfoItem(<Users className="h-4 w-4" />, "身高", `${user.height}cm`)}
              {user.weight && renderInfoItem(<Users className="h-4 w-4" />, "体重", `${user.weight}kg`)}
              {user.ethnicity && renderInfoItem(<Users className="h-4 w-4" />, "种族", user.ethnicity)}
              {user.religion && renderInfoItem(<Users className="h-4 w-4" />, "宗教", user.religion)}
              {user.personality_type && renderInfoItem(<Users className="h-4 w-4" />, "性格类型", user.personality_type)}
              {user.relationship_status && renderInfoItem(<Users className="h-4 w-4" />, "关系状态", user.relationship_status)}
            </div>
          </div>

          {/* 语言能力 */}
          {renderTags("语言能力", user.languages)}

          {/* 价值观偏好 */}
          {renderTags("价值观偏好", user.values_preferences)}

          {/* 关系目标 */}
          {renderTags("关系目标", user.relationship_goals)}

          {/* 生活方式 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">生活方式</h4>
            <div className="space-y-2">
              {user.family_plans && renderInfoItem(<Baby className="h-4 w-4" />, "家庭计划", user.family_plans)}
              {user.has_kids && renderInfoItem(<Baby className="h-4 w-4" />, "是否有孩子", typeof user.has_kids === 'boolean' ? (user.has_kids ? "是" : "否") : user.has_kids)}
              {user.smoking_status && renderInfoItem(<Cigarette className="h-4 w-4" />, "吸烟状态", user.smoking_status)}
              {user.drinking_status && renderInfoItem(<Wine className="h-4 w-4" />, "饮酒状态", user.drinking_status)}
              {user.dating_style && renderInfoItem(<Target className="h-4 w-4" />, "约会风格", user.dating_style)}
            </div>
          </div>

          {/* 兴趣标签 */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">兴趣爱好</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                  >
                    {getInterestDisplayName(interest)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSuperLike}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Star size={20} />
              <span>超级喜欢</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Heart size={20} />
              <span>喜欢</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 