'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserIcon, Edit, Save, X, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Ruler, Weight } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface UserProfile {
  id: number
  name: string
  email: string
  bio?: string
  location?: string
  birth_date?: string
  gender?: string
  avatar_url?: string
  occupation?: string
  education?: string
  relationship_status?: string
  height?: number
  weight?: number
}

export default function ProfileModal({ isOpen, onClose, userId }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('获取个人资料响应:', data)
        // 使用data.user而不是整个data对象
        const userData = data.user || data
        setProfile(userData)
        setEditedProfile(userData)
      } else {
        console.error('获取个人资料失败:', response.status)
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile()
    }
  }, [isOpen, userId, fetchProfile])

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

      console.log('保存个人资料数据:', editedProfile)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(editedProfile)
      })

      if (response.ok) {
        const updatedResponse = await response.json()
        console.log('更新个人资料响应:', updatedResponse)
        // 使用updatedResponse.user而不是整个updatedResponse对象
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
        setEditedProfile(updatedUserData)
        setIsEditing(false)
        console.log('个人资料保存成功')
      } else {
        console.error('更新个人资料失败:', response.status)
        const errorData = await response.json()
        console.error('错误详情:', errorData)
      }
    } catch (error) {
      console.error('更新用户资料失败:', error)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <div className="text-center">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">未找到用户资料</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">个人资料</h3>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>保存</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>编辑</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 头像区域 */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('头像加载失败，使用首字母代替')
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
                  className="text-4xl font-bold text-red-600"
                  style={{ display: profile.avatar_url ? 'none' : 'flex' }}
                >
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
            <p className="text-gray-600 mb-6">{profile.email}</p>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 个人简介 */}
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2" />
                个人简介
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="介绍一下你自己..."
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[80px]">
                  {profile.bio || '暂未填写'}
                </p>
              )}
            </div>

            {/* 位置 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                位置
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="你的位置"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.location || '未设置'}
                </p>
              )}
            </div>

            {/* 生日 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                生日
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedProfile.birth_date || ''}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('zh-CN') : '未设置'}
                </p>
              )}
            </div>

            {/* 职业 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 mr-2" />
                职业
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.occupation || ''}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="你的职业"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.occupation || '未设置'}
                </p>
              )}
            </div>

            {/* 教育背景 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4 mr-2" />
                教育背景
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.education || ''}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="你的教育背景"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.education || '未设置'}
                </p>
              )}
            </div>

            {/* 情感状态 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Heart className="h-4 w-4 mr-2" />
                情感状态
              </label>
              {isEditing ? (
                <select
                  value={editedProfile.relationship_status || ''}
                  onChange={(e) => handleInputChange('relationship_status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">选择状态</option>
                  <option value="single">单身</option>
                  <option value="dating">恋爱中</option>
                  <option value="married">已婚</option>
                  <option value="divorced">离异</option>
                  <option value="widowed">丧偶</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.relationship_status ? {
                    'single': '单身',
                    'dating': '恋爱中',
                    'married': '已婚',
                    'divorced': '离异',
                    'widowed': '丧偶'
                  }[profile.relationship_status] || profile.relationship_status : '未设置'}
                </p>
              )}
            </div>

            {/* 性别 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2" />
                性别
              </label>
              {isEditing ? (
                <select
                  value={editedProfile.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">选择性别</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.gender ? {
                    'male': '男',
                    'female': '女',
                    'other': '其他'
                  }[profile.gender] || profile.gender : '未设置'}
                </p>
              )}
            </div>

            {/* 身高 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Ruler className="h-4 w-4 mr-2" />
                身高 (cm)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile.height || ''}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="身高"
                  min="100"
                  max="250"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.height ? `${profile.height} cm` : '未设置'}
                </p>
              )}
            </div>

            {/* 体重 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Weight className="h-4 w-4 mr-2" />
                体重 (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="体重"
                  min="30"
                  max="300"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.weight ? `${profile.weight} kg` : '未设置'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 