'use client'

import { useState } from 'react'
import { MapPin, Calendar, Heart } from 'lucide-react'

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
}

export default function UserCard({ user }: UserCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

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

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
      {/* 照片区域 */}
      <div className="relative h-96 bg-gradient-to-br from-red-100 to-pink-100">
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
              <div className="flex items-center space-x-2 text-white/90 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user.location}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
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
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
              >
                {interest}
              </span>
            ))}
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