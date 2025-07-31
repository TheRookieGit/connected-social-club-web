'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { 
  UserIcon, Edit, Save, X, MapPin, Calendar, Briefcase, GraduationCap, 
  Heart, User, Ruler, Weight, Camera, Upload, Globe, BookOpen, Home, 
  Baby, Activity, Coffee, Wine, MessageCircle, Settings, Star, 
  Award, Palette, Music, Gamepad2, Utensils, Plane, Mountain, 
  BookOpenCheck, Users2, Sparkles, Target, Shield, Zap, MoreHorizontal, Check
} from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

import { UserProfile } from '@/types/user'

export default function ProfileModal({ isOpen, onClose, userId }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showValuesModal, setShowValuesModal] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 品质标签数据
  const valueTags = [
    { id: 'ambition', name: '有上进心' },
    { id: 'confidence', name: '自信' },
    { id: 'curiosity', name: '好奇心' },
    { id: 'emotional_intelligence', name: '高情商' },
    { id: 'empathy', name: '同理心' },
    { id: 'generosity', name: '大方' },
    { id: 'gratitude', name: '感恩' },
    { id: 'humility', name: '谦逊' },
    { id: 'humor', name: '幽默' },
    { id: 'kindness', name: '善良' },
    { id: 'leadership', name: '领导力' },
    { id: 'loyalty', name: '忠诚' },
    { id: 'openness', name: '开放' },
    { id: 'optimism', name: '乐观' },
    { id: 'playfulness', name: '有趣' },
    { id: 'sassiness', name: '活泼' }
  ]

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔄 开始获取个人资料...', new Date().toISOString())

      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const cacheBreaker = `t=${timestamp}&r=${randomId}&force=true`

      const response = await fetch(`/api/user/profile?${cacheBreaker}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Force-Refresh': 'true',
          'X-Cache-Bypass': 'true',
          'X-Timestamp': timestamp.toString(),
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
          'If-None-Match': '*'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setProfile(userData)
        setEditedProfile(userData)
      } else {
        console.error('❌ 获取个人资料失败:', response.status)
      }
    } catch (error) {
      console.error('❌ 获取用户资料失败:', error)
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

      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Force-Refresh': 'true',
          'X-Cache-Bypass': 'true',
          'X-Timestamp': timestamp.toString(),
          'X-Update-ID': `update-${timestamp}-${randomId}`,
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        },
        body: JSON.stringify({
          ...editedProfile,
          client_timestamp: new Date().toISOString(),
          update_id: `client-${timestamp}-${randomId}`
        })
      })

      if (response.ok) {
        const updatedResponse = await response.json()
        const updatedUserData = updatedResponse.user || updatedResponse
        setProfile(updatedUserData)
        setEditedProfile(updatedUserData)
        setIsEditing(false)
        
        setTimeout(() => {
          fetchProfile()
        }, 500)
      } else {
        console.error('❌ 更新个人资料失败:', response.status)
      }
    } catch (error) {
      console.error('❌ 更新用户资料失败:', error)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string | number | string[] | boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleValuesModalOpen = () => {
    setSelectedValues(editedProfile.values_preferences || [])
    setShowValuesModal(true)
  }

  const handleValuesModalClose = () => {
    setShowValuesModal(false)
  }

  const handleValueSelect = (valueId: string) => {
    setSelectedValues(prev => {
      if (prev.includes(valueId)) {
        return prev.filter(id => id !== valueId)
      } else {
        // 限制最多选择3个选项
        if (prev.length >= 3) {
          return prev
        }
        return [...prev, valueId]
      }
    })
  }

  const handleValuesConfirm = () => {
    setEditedProfile(prev => ({
      ...prev,
      values_preferences: selectedValues
    }))
    setShowValuesModal(false)
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const formData = new FormData()
      formData.append('avatar', file)

      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Force-Refresh': 'true',
          'X-Cache-Bypass': 'true',
          'X-Timestamp': timestamp.toString(),
          'X-Upload-ID': `upload-${timestamp}-${randomId}`,
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (profile) {
          const updatedProfile = { ...profile, avatar_url: data.avatar_url }
          setProfile(updatedProfile)
          setEditedProfile(updatedProfile)
        }
      } else {
        const errorData = await response.json()
        alert(`头像上传失败: ${errorData.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('❌ 头像上传失败:', error)
      alert('头像上传失败，请稍后重试')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const tabs = [
    { id: 'basic', label: '基本信息', icon: User, color: 'text-blue-600' },
    { id: 'photos', label: '照片', icon: Camera, color: 'text-purple-600' },
    { id: 'interests', label: '兴趣爱好', icon: Heart, color: 'text-pink-600' },
    { id: 'lifestyle', label: '生活方式', icon: Activity, color: 'text-green-600' },
    { id: 'values', label: '我希望你是...', icon: Star, color: 'text-yellow-600' }
  ]

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">加载个人资料中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8">
          <div className="text-center">
            <UserIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-600 text-lg">未找到用户资料</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm">
                  {profile.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt={profile.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  )}
                  
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-white/90 hover:bg-white text-red-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                    title="更换头像"
                  >
                    {isUploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-white/80">{profile.email}</p>
                {profile.location && (
                  <div className="flex items-center text-white/70 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200"
                  >
                    <Save className="h-4 w-4" />
                    <span>保存</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-white/80 hover:text-white transition-colors"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span>编辑资料</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className={`h-5 w-5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="p-6 overflow-y-auto max-h-[60vh] min-h-[500px]">
          {activeTab === 'basic' && (
            <div className="space-y-6 min-h-[450px]">
              {/* 个人简介 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <User className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">个人简介</h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full p-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    rows={4}
                    placeholder="介绍一下你自己，让其他人更好地了解你..."
                  />
                ) : (
                  <p className="text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl min-h-[100px] leading-relaxed">
                    {profile.bio || '这个人很懒，还没有写个人简介...'}
                  </p>
                )}
              </div>

              {/* 基础信息网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 年龄 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 text-red-500 mr-2" />
                    <h4 className="font-medium text-gray-900">年龄</h4>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.birth_date ? 
                      `${Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}岁` : 
                      '未设置'
                    }
                  </p>
                </div>

                {/* 身高 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Ruler className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-medium text-gray-900">身高</h4>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProfile.height || ''}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="身高(cm)"
                      min="100"
                      max="250"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.height ? `${profile.height}cm` : '未设置'}
                    </p>
                  )}
                </div>

                {/* 职业 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-900">职业</h4>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.occupation || ''}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="你的职业"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {profile.occupation || '未设置'}
                    </p>
                  )}
                </div>

                {/* 教育 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <GraduationCap className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="font-medium text-gray-900">教育</h4>
                  </div>
                  {isEditing ? (
                    <select
                      value={editedProfile.degree || ''}
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">选择学位</option>
                      <option value="博士">博士</option>
                      <option value="硕士">硕士</option>
                      <option value="本科">本科</option>
                      <option value="非本科（大专/自考）">非本科（大专/自考）</option>
                    </select>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {profile.degree || '未设置'}
                    </p>
                  )}
                </div>

                {/* 关系状态 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <Heart className="h-5 w-5 text-pink-500 mr-2" />
                    <h4 className="font-medium text-gray-900">关系状态</h4>
                  </div>
                  {isEditing ? (
                    <select
                      value={editedProfile.relationship_status || ''}
                      onChange={(e) => handleInputChange('relationship_status', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">选择状态</option>
                      <option value="单身">单身</option>
                      <option value="恋爱中">恋爱中</option>
                      <option value="已婚">已婚</option>
                      <option value="离异">离异</option>
                    </select>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {profile.relationship_status || '未设置'}
                    </p>
                  )}
                </div>

                {/* 约会目的 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="h-5 w-5 text-indigo-500 mr-2" />
                    <h4 className="font-medium text-gray-900">约会目的</h4>
                  </div>
                  {isEditing ? (
                    <select
                      value={editedProfile.dating_style || ''}
                      onChange={(e) => handleInputChange('dating_style', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">选择目的</option>
                      <option value="long_term">长期关系</option>
                      <option value="life_partner">人生伴侣</option>
                      <option value="casual_dates">有趣的随意约会</option>
                      <option value="intimacy_no_commitment">肉体关系</option>
                      <option value="ethical_non_monogamy">开放式关系</option>
                    </select>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {(() => {
                        const datingPurposeMap: { [key: string]: string } = {
                          'long_term': '长期关系',
                          'life_partner': '人生伴侣',
                          'casual_dates': '有趣的随意约会',
                          'intimacy_no_commitment': '肉体关系',
                          'ethical_non_monogamy': '开放式关系'
                        }
                        return datingPurposeMap[profile.dating_style || ''] || profile.dating_style || '未设置'
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6 min-h-[450px]">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Camera className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">我的照片</h3>
                  </div>
                  <button
                    onClick={() => {
                      onClose()
                      window.open('/user-photos', '_blank')
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    管理照片
                  </button>
                </div>
                
                {profile.photos && profile.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Image
                          src={photo}
                          alt={`照片 ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">还没有上传照片</p>
                    <button
                      onClick={() => {
                        onClose()
                        window.open('/user-photos', '_blank')
                      }}
                      className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                    >
                      上传第一张照片
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

                     {activeTab === 'interests' && (
             <div className="space-y-6 min-h-[450px]">
               <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-6">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center">
                     <Heart className="h-6 w-6 text-pink-600 mr-3" />
                     <h3 className="text-lg font-semibold text-gray-900">兴趣爱好</h3>
                   </div>
                   {!isEditing && (
                     <button
                       onClick={handleEdit}
                       className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
                     >
                       编辑兴趣
                     </button>
                   )}
                 </div>
                 
                 {isEditing ? (
                   <div className="space-y-6">
                     {/* 当前选择的兴趣 */}
                     <div>
                       <h4 className="text-sm font-medium text-gray-700 mb-3">当前选择 ({editedProfile.interests?.length || 0}/5)</h4>
                       {editedProfile.interests && editedProfile.interests.length > 0 ? (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                           {editedProfile.interests.map((interest, index) => {
                             const interestMap: { [key: string]: { icon: any, label: string, color: string } } = {
                               'baking': { icon: Utensils, label: '烘焙', color: 'bg-white text-pink-600' },
                               'lgbtq_rights': { icon: Heart, label: 'LGBTQ+', color: 'bg-white text-pink-600' },
                               'hiking': { icon: Mountain, label: '徒步', color: 'bg-white text-pink-600' },
                               'gardening': { icon: Palette, label: '园艺', color: 'bg-white text-pink-600' },
                               'rnb': { icon: Music, label: '音乐', color: 'bg-white text-pink-600' },
                               'art': { icon: Palette, label: '艺术', color: 'bg-white text-pink-600' },
                               'writing': { icon: BookOpenCheck, label: '写作', color: 'bg-white text-pink-600' },
                               'country': { icon: Palette, label: '绘画', color: 'bg-white text-pink-600' },
                               'skiing': { icon: Mountain, label: '阅读', color: 'bg-white text-pink-600' },
                               'museums': { icon: BookOpen, label: '博物馆', color: 'bg-white text-pink-600' },
                               'vegetarian': { icon: Utensils, label: '素食', color: 'bg-white text-pink-600' },
                               'horror': { icon: Activity, label: '电影', color: 'bg-white text-pink-600' },
                               'dancing': { icon: Activity, label: '跳舞', color: 'bg-white text-pink-600' },
                               'yoga': { icon: Activity, label: '瑜伽', color: 'bg-white text-pink-600' },
                               'dogs': { icon: Heart, label: '狗', color: 'bg-white text-pink-600' },
                               'crafts': { icon: Palette, label: '手工艺', color: 'bg-white text-pink-600' },
                               'festivals': { icon: Activity, label: '节日', color: 'bg-white text-pink-600' },
                               'tennis': { icon: Activity, label: '运动', color: 'bg-white text-pink-600' },
                               'cats': { icon: Heart, label: '猫', color: 'bg-white text-pink-600' },
                               'concerts': { icon: Music, label: '音乐会', color: 'bg-white text-pink-600' },
                               'foodie': { icon: Utensils, label: '美食', color: 'bg-white text-pink-600' },
                               'exploring_cities': { icon: Plane, label: '旅游', color: 'bg-white text-pink-600' },
                               'camping': { icon: Mountain, label: '露营', color: 'bg-white text-pink-600' },
                               'wine': { icon: Wine, label: '葡萄酒', color: 'bg-white text-pink-600' },
                               'feminism': { icon: Heart, label: '女权主义', color: 'bg-white text-pink-600' },
                               'coffee': { icon: Coffee, label: '咖啡', color: 'bg-white text-pink-600' },
                               'gaming': { icon: Gamepad2, label: '游戏', color: 'bg-white text-pink-600' }
                             }
                             
                             const interestInfo = interestMap[interest] || { icon: Heart, label: interest, color: 'bg-gray-100 text-gray-600' }
                             const IconComponent = interestInfo.icon
                             
                             return (
                               <div key={index} className={`${interestInfo.color} rounded-xl p-3 flex items-center justify-between`}>
                                 <div className="flex items-center space-x-2">
                                   <IconComponent className="h-4 w-4" />
                                   <span className="font-medium text-sm">{interestInfo.label}</span>
                                 </div>
                                 <button
                                   onClick={() => {
                                     const newInterests = editedProfile.interests?.filter((_, i) => i !== index) || []
                                     handleInputChange('interests', newInterests)
                                   }}
                                   className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1"
                                 >
                                   <X className="h-4 w-4" />
                                 </button>
                               </div>
                             )
                           })}
                         </div>
                       ) : (
                         <p className="text-gray-500 text-sm italic">还没有选择任何兴趣</p>
                       )}
                     </div>

                     {/* 选择更多兴趣 */}
                     <div>
                       <h4 className="text-sm font-medium text-gray-700 mb-3">选择更多兴趣</h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                         {(() => {
                             const allInterests = [
    { id: 'baking', icon: Utensils, label: '烘焙', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'lgbtq_rights', icon: Heart, label: 'LGBTQ+', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'hiking', icon: Mountain, label: '徒步', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'gardening', icon: Palette, label: '园艺', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'rnb', icon: Music, label: '音乐', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'art', icon: Palette, label: '艺术', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'writing', icon: BookOpenCheck, label: '写作', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'country', icon: Palette, label: '绘画', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'skiing', icon: Mountain, label: '阅读', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'museums', icon: BookOpen, label: '博物馆', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'vegetarian', icon: Utensils, label: '素食', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'horror', icon: Activity, label: '电影', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'dancing', icon: Activity, label: '跳舞', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'yoga', icon: Activity, label: '瑜伽', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'dogs', icon: Heart, label: '狗', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'crafts', icon: Palette, label: '手工艺', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'festivals', icon: Activity, label: '节日', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'tennis', icon: Activity, label: '运动', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'cats', icon: Heart, label: '猫', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'concerts', icon: Music, label: '音乐会', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'foodie', icon: Utensils, label: '美食', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'exploring_cities', icon: Plane, label: '旅游', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'camping', icon: Mountain, label: '露营', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'wine', icon: Wine, label: '葡萄酒', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'feminism', icon: Heart, label: '女权主义', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'coffee', icon: Coffee, label: '咖啡', color: 'bg-white text-pink-600 hover:bg-pink-50' },
    { id: 'gaming', icon: Gamepad2, label: '游戏', color: 'bg-white text-pink-600 hover:bg-pink-50' }
  ]
                           
                           const currentInterests = editedProfile.interests || []
                           
                           return allInterests.map((interest) => {
                             const IconComponent = interest.icon
                             const isSelected = currentInterests.includes(interest.id)
                             const isDisabled = !isSelected && currentInterests.length >= 5
                             
                             return (
                               <button
                                 key={interest.id}
                                 onClick={() => {
                                   if (isSelected) {
                                     const newInterests = currentInterests.filter(id => id !== interest.id)
                                     handleInputChange('interests', newInterests)
                                   } else if (!isDisabled) {
                                     const newInterests = [...currentInterests, interest.id]
                                     handleInputChange('interests', newInterests)
                                   }
                                 }}
                                 disabled={isDisabled}
                                 className={`${interest.color} rounded-xl p-3 flex items-center space-x-2 transition-all duration-200 ${
                                   isSelected 
                                     ? 'ring-2 ring-pink-500 ring-offset-2' 
                                     : isDisabled 
                                       ? 'opacity-50 cursor-not-allowed' 
                                       : 'hover:scale-105'
                                 }`}
                               >
                                 <IconComponent className="h-4 w-4" />
                                 <span className="font-medium text-sm">{interest.label}</span>
                                 {isSelected && (
                                   <div className="ml-auto">
                                     <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                       <div className="w-2 h-2 bg-white rounded-full"></div>
                                     </div>
                                   </div>
                                 )}
                               </button>
                             )
                           })
                         })()}
                       </div>
                       {editedProfile.interests && editedProfile.interests.length >= 5 && (
                         <p className="text-sm text-gray-500 mt-2">最多只能选择5个兴趣</p>
                       )}
                     </div>
                   </div>
                 ) : (
                   <>
                     {profile.interests && profile.interests.length > 0 ? (
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         {profile.interests.map((interest, index) => {
                             const interestMap: { [key: string]: { icon: any, label: string, color: string } } = {
    'baking': { icon: Utensils, label: '烘焙', color: 'bg-white text-pink-600' },
    'lgbtq_rights': { icon: Heart, label: 'LGBTQ+', color: 'bg-white text-pink-600' },
    'hiking': { icon: Mountain, label: '徒步', color: 'bg-white text-pink-600' },
    'gardening': { icon: Palette, label: '园艺', color: 'bg-white text-pink-600' },
    'rnb': { icon: Music, label: '音乐', color: 'bg-white text-pink-600' },
    'art': { icon: Palette, label: '艺术', color: 'bg-white text-pink-600' },
    'writing': { icon: BookOpenCheck, label: '写作', color: 'bg-white text-pink-600' },
    'country': { icon: Palette, label: '绘画', color: 'bg-white text-pink-600' },
    'skiing': { icon: Mountain, label: '阅读', color: 'bg-white text-pink-600' },
    'museums': { icon: BookOpen, label: '博物馆', color: 'bg-white text-pink-600' },
    'vegetarian': { icon: Utensils, label: '素食', color: 'bg-white text-pink-600' },
    'horror': { icon: Activity, label: '电影', color: 'bg-white text-pink-600' },
    'dancing': { icon: Activity, label: '跳舞', color: 'bg-white text-pink-600' },
    'yoga': { icon: Activity, label: '瑜伽', color: 'bg-white text-pink-600' },
    'dogs': { icon: Heart, label: '狗', color: 'bg-white text-pink-600' },
    'crafts': { icon: Palette, label: '手工艺', color: 'bg-white text-pink-600' },
    'festivals': { icon: Activity, label: '节日', color: 'bg-white text-pink-600' },
    'tennis': { icon: Activity, label: '运动', color: 'bg-white text-pink-600' },
    'cats': { icon: Heart, label: '猫', color: 'bg-white text-pink-600' },
    'concerts': { icon: Music, label: '音乐会', color: 'bg-white text-pink-600' },
    'foodie': { icon: Utensils, label: '美食', color: 'bg-white text-pink-600' },
    'exploring_cities': { icon: Plane, label: '旅游', color: 'bg-white text-pink-600' },
    'camping': { icon: Mountain, label: '露营', color: 'bg-white text-pink-600' },
    'wine': { icon: Wine, label: '葡萄酒', color: 'bg-white text-pink-600' },
    'feminism': { icon: Heart, label: '女权主义', color: 'bg-white text-pink-600' },
    'coffee': { icon: Coffee, label: '咖啡', color: 'bg-white text-pink-600' },
    'gaming': { icon: Gamepad2, label: '游戏', color: 'bg-white text-pink-600' }
  }
                           
                           const interestInfo = interestMap[interest] || { icon: Heart, label: interest, color: 'bg-gray-100 text-gray-600' }
                           const IconComponent = interestInfo.icon
                           
                           return (
                             <div key={index} className={`${interestInfo.color} rounded-2xl p-4 flex items-center space-x-3`}>
                               <IconComponent className="h-5 w-5" />
                               <span className="font-medium">{interestInfo.label}</span>
                             </div>
                           )
                         })}
                       </div>
                     ) : (
                       <div className="text-center py-12">
                         <Heart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
                         <p className="text-gray-500">还没有添加兴趣爱好</p>
                       </div>
                     )}
                   </>
                 )}
               </div>
             </div>
           )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-6 min-h-[450px]">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                <div className="flex items-center mb-6">
                  <Activity className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">生活方式</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 家庭计划 */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Baby className="h-5 w-5 text-pink-500 mr-2" />
                      <h4 className="font-medium text-gray-900">家庭计划</h4>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedProfile.family_plans || ''}
                        onChange={(e) => handleInputChange('family_plans', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="">选择计划</option>
                        <option value="dont_want_kids">不想要孩子</option>
                        <option value="open_to_kids">对孩子持开放态度</option>
                        <option value="want_kids">想要孩子</option>
                        <option value="not_sure">不确定</option>
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-gray-900">
                        {(() => {
                          const familyPlansMap: { [key: string]: string } = {
                            'dont_want_kids': '不想要孩子',
                            'open_to_kids': '对孩子持开放态度',
                            'want_kids': '想要孩子',
                            'not_sure': '不确定'
                          }
                          return familyPlansMap[profile.family_plans || ''] || profile.family_plans || '未设置'
                        })()}
                      </p>
                    )}
                  </div>

                  {/* 孩子 */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Baby className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-900">孩子</h4>
                    </div>
                    {isEditing ? (
                      <select
                        value={typeof editedProfile.has_kids === 'string' ? editedProfile.has_kids : (editedProfile.has_kids === true ? 'have_kids' : 'dont_have_kids')}
                        onChange={(e) => handleInputChange('has_kids', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">选择状态</option>
                        <option value="dont_have_kids">没有孩子</option>
                        <option value="have_kids">有孩子</option>
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-gray-900">
                        {(() => {
                          const hasKidsMap: { [key: string]: string } = {
                            'dont_have_kids': '没有孩子',
                            'have_kids': '有孩子'
                          }
                          const hasKidsValue = typeof profile.has_kids === 'string' ? profile.has_kids : (profile.has_kids === true ? 'have_kids' : 'dont_have_kids')
                          return hasKidsMap[hasKidsValue] || (profile.has_kids === true ? '有孩子' : '没有孩子')
                        })()}
                      </p>
                    )}
                  </div>

                  {/* 吸烟 */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Coffee className="h-5 w-5 text-orange-500 mr-2" />
                      <h4 className="font-medium text-gray-900">吸烟</h4>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedProfile.smoking_status || ''}
                        onChange={(e) => handleInputChange('smoking_status', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">选择状态</option>
                        <option value="yes_smoke">是的，我吸烟</option>
                        <option value="sometimes_smoke">我有时吸烟</option>
                        <option value="no_smoke">不，我不吸烟</option>
                        <option value="trying_quit">我正在尝试戒烟</option>
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-gray-900">
                        {(() => {
                          const smokingMap: { [key: string]: string } = {
                            'yes_smoke': '是的，我吸烟',
                            'sometimes_smoke': '我有时吸烟',
                            'no_smoke': '不，我不吸烟',
                            'trying_quit': '我正在尝试戒烟'
                          }
                          return smokingMap[profile.smoking_status || ''] || profile.smoking_status || '未设置'
                        })()}
                      </p>
                    )}
                  </div>

                  {/* 饮酒 */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Wine className="h-5 w-5 text-purple-500 mr-2" />
                      <h4 className="font-medium text-gray-900">饮酒</h4>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedProfile.drinking_status || ''}
                        onChange={(e) => handleInputChange('drinking_status', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">选择状态</option>
                        <option value="yes_drink">是的，我喝酒</option>
                        <option value="sometimes_drink">我有时喝酒</option>
                        <option value="rarely_drink">我很少喝酒</option>
                        <option value="no_drink">不，我不喝酒</option>
                        <option value="sober">我戒酒了</option>
                      </select>
                    ) : (
                      <p className="text-lg font-medium text-gray-900">
                        {(() => {
                          const drinkingMap: { [key: string]: string } = {
                            'yes_drink': '是的，我喝酒',
                            'sometimes_drink': '我有时喝酒',
                            'rarely_drink': '我很少喝酒',
                            'no_drink': '不，我不喝酒',
                            'sober': '我戒酒了'
                          }
                          return drinkingMap[profile.drinking_status || ''] || profile.drinking_status || '未设置'
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-6 min-h-[450px]">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Star className="h-6 w-6 text-yellow-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">我希望你是...</h3>
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleValuesModalOpen}
                      className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="text-sm font-medium">选择</span>
                    </button>
                  )}
                </div>
                
                {(() => {
                  const currentValues = isEditing ? editedProfile.values_preferences : profile.values_preferences
                  return currentValues && currentValues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentValues.map((value, index) => {
                        const valueMap: { [key: string]: { icon: any, label: string, color: string } } = {
                          'ambition': { icon: Target, label: '有上进心', color: 'bg-blue-100 text-blue-600' },
                          'confidence': { icon: Star, label: '自信', color: 'bg-yellow-100 text-yellow-600' },
                          'curiosity': { icon: Sparkles, label: '好奇心', color: 'bg-purple-100 text-purple-600' },
                          'emotional_intelligence': { icon: Heart, label: '高情商', color: 'bg-pink-100 text-pink-600' },
                          'empathy': { icon: Users2, label: '同理心', color: 'bg-green-100 text-green-600' },
                          'generosity': { icon: Heart, label: '大方', color: 'bg-red-100 text-red-600' },
                          'gratitude': { icon: Star, label: '感恩', color: 'bg-amber-100 text-amber-600' },
                          'humility': { icon: Shield, label: '谦逊', color: 'bg-gray-100 text-gray-600' },
                          'humor': { icon: Sparkles, label: '幽默', color: 'bg-indigo-100 text-indigo-600' },
                          'kindness': { icon: Heart, label: '善良', color: 'bg-rose-100 text-rose-600' },
                          'leadership': { icon: Target, label: '领导力', color: 'bg-blue-100 text-blue-600' },
                          'loyalty': { icon: Shield, label: '忠诚', color: 'bg-emerald-100 text-emerald-600' },
                          'openness': { icon: Zap, label: '开放', color: 'bg-cyan-100 text-cyan-600' },
                          'optimism': { icon: Star, label: '乐观', color: 'bg-yellow-100 text-yellow-600' },
                          'playfulness': { icon: Sparkles, label: '有趣', color: 'bg-violet-100 text-violet-600' },
                          'sassiness': { icon: Zap, label: '活泼', color: 'bg-orange-100 text-orange-600' }
                        }
                        
                        const valueInfo = valueMap[value] || { icon: Star, label: value, color: 'bg-gray-100 text-gray-600' }
                        const IconComponent = valueInfo.icon
                        
                        return (
                          <div key={index} className={`${valueInfo.color} rounded-2xl p-4 flex items-center space-x-3`}>
                            <IconComponent className="h-5 w-5" />
                            <span className="font-medium">{valueInfo.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
                      <p className="text-gray-500">还没有添加期望的伴侣特质</p>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

      {/* 价值观选择弹窗 */}
      {showValuesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">选择期望的伴侣特质</h3>
              <button
                onClick={handleValuesModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                选择最多3个你希望伴侣拥有的品质
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>已选择: {selectedValues.length}/3</span>
                {selectedValues.length >= 3 && (
                  <span className="text-orange-600">已达到最大选择数量</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {valueTags.map((tag) => {
                const isSelected = selectedValues.includes(tag.id)
                const isDisabled = !isSelected && selectedValues.length >= 3
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleValueSelect(tag.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300 hover:bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isSelected && <Check className="h-4 w-4" />}
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleValuesModalClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleValuesConfirm}
                className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
              >
                确认选择
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
} 