'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Camera, User, Heart, MessageCircle, MapPin, Calendar, Briefcase, GraduationCap, X, Edit, Save } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  photos?: string[]
  bio?: string
  location?: string
  occupation?: string
  school?: string
  degree?: string
  birth_date?: string
  height?: number
  relationship_status?: string
  dating_style?: string
  family_plans?: string
  has_kids?: boolean | string
  smoking_status?: string
  drinking_status?: string
  interests?: string[]
  values_preferences?: string[]
  employer?: string
  religion?: string
  hometown?: string
  languages?: string
  marital_status?: string
  exercise_frequency?: string
  ethnicity?: string
  weight?: number
  degree?: string
  relationship_goals?: string
}

export default function UserPhotos() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const userData = data.user || data
          setProfile(userData)
          setEditedProfile(userData)
        } else {
          console.error('获取用户资料失败')
        }
      } catch (error) {
        console.error('获取用户资料错误:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile || {})
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedProfile)
      })

      if (response.ok) {
        const updatedResponse = await response.json()
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
        setEditedProfile(updatedUserData)
        setIsEditing(false)
      } else {
        console.error('更新个人资料失败')
      }
    } catch (error) {
      console.error('更新用户资料失败:', error)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string | number | string[] | boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null)
  }

  const handlePreviousPhoto = () => {
    if (selectedPhotoIndex !== null && profile?.photos) {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : profile.photos.length - 1)
    }
  }

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && profile?.photos) {
      setSelectedPhotoIndex(selectedPhotoIndex < profile.photos.length - 1 ? selectedPhotoIndex + 1 : 0)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">未找到用户资料</p>
        </div>
      </div>
    )
  }

  const photos = profile.photos || []
  const photoCount = photos.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回</span>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">我的照片</h1>
          
          <button
            onClick={handleEdit}
            className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>编辑资料</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 用户基本信息 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-red-600">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
              <p className="text-gray-600 mb-3">{profile.email}</p>
              
              {/* 基础信息网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {profile.birth_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}岁
                    </span>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{profile.location}</span>
                  </div>
                )}
                
                {profile.occupation && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{profile.occupation}</span>
                  </div>
                )}
                
                {profile.school && (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{profile.school}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 个人简介 */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">个人简介</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* 照片展示区域 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>我的照片</span>
              <span className="text-sm text-gray-500">({photoCount}张)</span>
            </h3>
            
            {photoCount === 0 && (
              <button
                onClick={() => router.push('/photos')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                添加照片
              </button>
            )}
          </div>

          {photoCount === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有上传任何照片</p>
              <p className="text-sm text-gray-400">上传照片让其他用户更好地了解你</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handlePhotoClick(index)}
                >
                  <Image
                    src={photo}
                    alt={`照片 ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 编辑模式下的个人资料编辑 */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">编辑个人资料</h3>
            
            <div className="space-y-4">
              {/* 个人简介编辑 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人简介
                </label>
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="介绍一下你自己..."
                />
              </div>

              {/* 基础信息编辑 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    职业
                  </label>
                  <input
                    type="text"
                    value={editedProfile.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="你的职业"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    位置
                  </label>
                  <input
                    type="text"
                    value={editedProfile.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="你的位置"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学校
                  </label>
                  <input
                    type="text"
                    value={editedProfile.school || ''}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="你的学校"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={editedProfile.height || ''}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="身高"
                    min="100"
                    max="250"
                  />
                </div>
              </div>

              {/* 编辑按钮 */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>保存</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 照片查看模态框 */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* 关闭按钮 */}
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* 上一张/下一张按钮 */}
            {photoCount > 1 && (
              <>
                <button
                  onClick={handlePreviousPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 rotate-180" />
                </button>
              </>
            )}

            {/* 照片 */}
            <div className="relative">
              <Image
                src={photos[selectedPhotoIndex]}
                alt={`照片 ${selectedPhotoIndex + 1}`}
                width={800}
                height={800}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>

            {/* 照片信息 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <span className="text-sm">
                {selectedPhotoIndex + 1} / {photoCount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 