'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Calendar, Heart, Star, X, Briefcase, GraduationCap, Users, Languages, Baby, Cigarette, Wine, Target, Ruler, Home, Coffee, Activity, BookOpen, Music, Plane, Mountain, Utensils, Gamepad2, Palette, BookOpenCheck, Users2, Sparkles, Shield, Zap, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, PanInfo, useAnimation } from 'framer-motion'

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
  const [isDragging, setIsDragging] = useState(false)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  if (!user || !isOpen) return null

  // 调试信息：打印用户数据
  console.log('UserDetailModal - 接收到的用户数据:', user)
  console.log('UserDetailModal - 照片数组:', user?.photos)
  console.log('UserDetailModal - 照片数量:', user?.photos?.length)
  console.log('UserDetailModal - 当前照片索引:', currentPhotoIndex)

  // 兴趣标签映射
  const interestTags = [
    { id: 'baking', name: '烘焙', emoji: '🍰', icon: Utensils },
    { id: 'lgbtq_rights', name: 'LGBTQ+', emoji: '🏳️‍🌈', icon: Heart },
    { id: 'hiking', name: '徒步', emoji: '⛰️', icon: Mountain },
    { id: 'gardening', name: '园艺', emoji: '🌱', icon: Palette },
    { id: 'rnb', name: '音乐', emoji: '🎵', icon: Music },
    { id: 'art', name: '艺术', emoji: '🎨', icon: Palette },
    { id: 'writing', name: '写作', emoji: '📝', icon: BookOpenCheck },
    { id: 'country', name: '绘画', emoji: '🖼️', icon: Palette },
    { id: 'skiing', name: '阅读', emoji: '📚', icon: BookOpen },
    { id: 'museums', name: '博物馆', emoji: '🏛️', icon: BookOpen },
    { id: 'vegetarian', name: '素食', emoji: '🥦', icon: Utensils },
    { id: 'horror', name: '电影', emoji: '📺', icon: Activity },
    { id: 'dancing', name: '跳舞', emoji: '💃', icon: Activity },
    { id: 'yoga', name: '瑜伽', emoji: '🧘', icon: Activity },
    { id: 'dogs', name: '狗', emoji: '🐶', icon: Heart },
    { id: 'crafts', name: '手工艺', emoji: '🧷', icon: Palette },
    { id: 'festivals', name: '节日', emoji: '🎉', icon: Activity },
    { id: 'tennis', name: '运动', emoji: '🎾', icon: Activity },
    { id: 'cats', name: '猫', emoji: '🐱', icon: Heart },
    { id: 'concerts', name: '音乐会', emoji: '🎟️', icon: Music },
    { id: 'foodie', name: '美食', emoji: '🍜', icon: Utensils },
    { id: 'exploring_cities', name: '旅游', emoji: '🏙️', icon: Plane },
    { id: 'camping', name: '露营', emoji: '⛺', icon: Mountain },
    { id: 'wine', name: '葡萄酒', emoji: '🍷', icon: Wine },
    { id: 'feminism', name: '女权主义', emoji: '💛', icon: Heart },
    { id: 'coffee', name: '咖啡', emoji: '☕', icon: Coffee },
    { id: 'gaming', name: '游戏', emoji: '🎮', icon: Gamepad2 }
  ]

  // 价值观标签映射
  const valueTags = [
    { id: 'ambition', name: '有上进心', icon: Target, color: 'bg-blue-100 text-blue-600' },
    { id: 'confidence', name: '自信', icon: Star, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'curiosity', name: '好奇心', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
    { id: 'emotional_intelligence', name: '高情商', icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { id: 'empathy', name: '同理心', icon: Users2, color: 'bg-green-100 text-green-600' },
    { id: 'generosity', name: '大方', icon: Heart, color: 'bg-red-100 text-red-600' },
    { id: 'gratitude', name: '感恩', icon: Star, color: 'bg-amber-100 text-amber-600' },
    { id: 'humility', name: '谦逊', icon: Shield, color: 'bg-gray-100 text-gray-600' },
    { id: 'humor', name: '幽默', icon: Sparkles, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'kindness', name: '善良', icon: Heart, color: 'bg-rose-100 text-rose-600' },
    { id: 'leadership', name: '领导力', icon: Target, color: 'bg-blue-100 text-blue-600' },
    { id: 'loyalty', name: '忠诚', icon: Shield, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'openness', name: '开放', icon: Zap, color: 'bg-cyan-100 text-cyan-600' },
    { id: 'optimism', name: '乐观', icon: Star, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'playfulness', name: '有趣', icon: Sparkles, color: 'bg-violet-100 text-violet-600' },
    { id: 'sassiness', name: '活泼', icon: Zap, color: 'bg-orange-100 text-orange-600' }
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

  // 处理拖拽手势
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 50 // 拖拽阈值

    if (info.offset.x > threshold && currentPhotoIndex > 0) {
      // 向右拖拽，显示上一张
      setCurrentPhotoIndex(prev => prev - 1)
    } else if (info.offset.x < -threshold && currentPhotoIndex < user.photos.length - 1) {
      // 向左拖拽，显示下一张
      setCurrentPhotoIndex(prev => prev + 1)
    }
  }

  // 处理触摸滑动
  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // 获取兴趣标签的显示名称
  const getInterestDisplayName = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    return tag ? tag.name : interestId
  }

  // 获取兴趣标签的图标
  const getInterestIcon = (interestId: string) => {
    const tag = interestTags.find(tag => tag.id === interestId)
    return tag ? tag.icon : Heart
  }

  // 获取价值观标签信息
  const getValueInfo = (valueId: string) => {
    const tag = valueTags.find(tag => tag.id === valueId)
    return tag || { name: valueId, icon: Star, color: 'bg-gray-100 text-gray-600' }
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
      <div className="flex items-center space-x-3 text-sm text-gray-700 mb-2">
        <div className="text-gray-500">{icon}</div>
        <span className="font-medium">{label}:</span>
        <span>{value}</span>
      </div>
    )
  }

  // 渲染标签列表
  const renderTags = (label: string, tags: string[] | null | undefined, type: 'interest' | 'value' = 'interest') => {
    if (!tags || tags.length === 0) return null
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{label}</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => {
            if (type === 'interest') {
              const IconComponent = getInterestIcon(tag)
              return (
                <span
                  key={index}
                  className="px-3 py-2 bg-pink-50 text-pink-700 text-sm rounded-xl flex items-center space-x-2 border border-pink-200"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{getInterestDisplayName(tag)}</span>
                </span>
              )
            } else {
              const valueInfo = getValueInfo(tag)
              const IconComponent = valueInfo.icon
              return (
                <span
                  key={index}
                  className={`px-3 py-2 text-sm rounded-xl flex items-center space-x-2 border ${valueInfo.color.replace('bg-', 'border-').replace('text-', '')}`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{valueInfo.name}</span>
                </span>
              )
            }
          })}
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
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden relative"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 照片区域 - 支持滑动 */}
        <div className="relative h-80 bg-gradient-to-br from-red-100 to-pink-100 overflow-hidden">
          {/* 照片容器 */}
          <motion.div
            ref={containerRef}
            className="w-full h-full flex"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleTouchStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            animate={controls}
            style={{
              transform: `translateX(-${currentPhotoIndex * 100}%)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* 显示所有照片 */}
            {user.photos && user.photos.length > 0 ? (
              user.photos.map((photo, index) => {
                console.log(`渲染照片 ${index + 1}:`, photo)
                return (
                  <div key={index} className="w-full h-full flex-shrink-0 relative">
                    {photo && photo !== '/api/placeholder/400/600' ? (
                      <img 
                        src={photo} 
                        alt={`${user.name} 照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`照片 ${index + 1} 加载失败:`, photo)
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                        }}
                        onLoad={() => {
                          console.log(`照片 ${index + 1} 加载成功:`, photo)
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
                  </div>
                )
              })
            ) : (
              // 如果没有照片，显示用户首字母
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-bold text-red-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>
          
          {/* 照片指示器 */}
          {user.photos && user.photos.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex space-x-2">
                {user.photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentPhotoIndex ? 'bg-white scale-125' : 'bg-white/50'
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
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* 照片计数器 */}
          {user.photos && user.photos.length > 1 && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {currentPhotoIndex + 1} / {user.photos.length}
              </div>
            </div>
          )}

          {/* 在线状态 */}
          <div className="absolute top-4 left-4 z-20">
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

          {/* 滑动提示 */}
          {user.photos && user.photos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <ChevronLeft size={12} />
                <span>滑动查看更多</span>
                <ChevronRight size={12} />
              </div>
            </div>
          )}
        </div>

        {/* 详细信息 - 可滚动区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-320px)]">
          {/* 个人简介 */}
          {user.bio && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">个人简介</h4>
              <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl">
                {user.bio}
              </p>
            </div>
          )}

          {/* 基本信息 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">基本信息</h4>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              {renderInfoItem(<Calendar className="h-4 w-4" />, "年龄", `${user.age}岁`)}
              {renderInfoItem(<MapPin className="h-4 w-4" />, "位置", user.location)}
              {renderInfoItem(<Briefcase className="h-4 w-4" />, "职业", user.occupation)}
              {renderInfoItem(<GraduationCap className="h-4 w-4" />, "教育", user.education)}
              {user.school && renderInfoItem(<GraduationCap className="h-4 w-4" />, "学校", user.school)}
              {user.degree && renderInfoItem(<GraduationCap className="h-4 w-4" />, "学位", user.degree)}
              {user.employer && renderInfoItem(<Briefcase className="h-4 w-4" />, "雇主", user.employer)}
              {user.height && renderInfoItem(<Ruler className="h-4 w-4" />, "身高", `${user.height}cm`)}
              {user.weight && renderInfoItem(<Users className="h-4 w-4" />, "体重", `${user.weight}kg`)}
              {user.ethnicity && renderInfoItem(<Users className="h-4 w-4" />, "种族", user.ethnicity)}
              {user.religion && renderInfoItem(<Users className="h-4 w-4" />, "宗教", user.religion)}
              {user.personality_type && renderInfoItem(<Users className="h-4 w-4" />, "性格类型", user.personality_type)}
              {user.relationship_status && renderInfoItem(<Heart className="h-4 w-4" />, "关系状态", user.relationship_status)}
            </div>
          </div>

          {/* 语言能力 */}
          {user.languages && user.languages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">语言能力</h4>
              <div className="flex flex-wrap gap-2">
                {user.languages.map((language, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-200 flex items-center space-x-2"
                  >
                    <Languages className="h-4 w-4" />
                    <span>{language}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 生活方式 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">生活方式</h4>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              {user.family_plans && renderInfoItem(<Baby className="h-4 w-4" />, "家庭计划", user.family_plans)}
              {user.has_kids && renderInfoItem(<Baby className="h-4 w-4" />, "是否有孩子", typeof user.has_kids === 'boolean' ? (user.has_kids ? "是" : "否") : user.has_kids)}
              {user.smoking_status && renderInfoItem(<Cigarette className="h-4 w-4" />, "吸烟状态", user.smoking_status)}
              {user.drinking_status && renderInfoItem(<Wine className="h-4 w-4" />, "饮酒状态", user.drinking_status)}
              {user.dating_style && renderInfoItem(<Target className="h-4 w-4" />, "约会风格", user.dating_style)}
            </div>
          </div>

          {/* 兴趣标签 */}
          {renderTags("兴趣爱好", user.interests, 'interest')}

          {/* 价值观偏好 */}
          {renderTags("我希望你是...", user.values_preferences, 'value')}

          {/* 关系目标 */}
          {user.relationship_goals && user.relationship_goals.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">关系目标</h4>
              <div className="flex flex-wrap gap-2">
                {user.relationship_goals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-xl border border-purple-200"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 底部间距 */}
          <div className="h-4"></div>
        </div>

        {/* 操作按钮 - 固定在底部 */}
        <div className="p-6 border-t border-gray-100 bg-white">
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