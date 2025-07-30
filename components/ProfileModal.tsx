'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { UserIcon, Edit, Save, X, MapPin, Calendar, Briefcase, GraduationCap, Heart, User, Ruler, Weight, Camera, Upload, Globe, BookOpen, Home, Baby, Activity, Coffee, Wine, MessageCircle, Settings } from 'lucide-react'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔄 开始获取个人资料...', new Date().toISOString())

      // 创建更强的缓存绕过参数
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
          // 添加更多强制刷新头部
          'X-Requested-With': 'XMLHttpRequest',
          'X-Force-Refresh': 'true',
          'X-Cache-Bypass': 'true',
          'X-Timestamp': timestamp.toString(),
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
          'If-None-Match': '*'
        }
      })

      console.log('📡 获取资料API响应状态:', response.status)
      console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 获取个人资料响应:', data)
        
        // 验证数据完整性
        const userData = data.user || data
        console.log('✅ 解析后的用户数据:', userData)
        console.log('✅ 用户bio字段:', userData.bio)
        console.log('✅ 用户location字段:', userData.location)
        console.log('✅ 数据时间戳:', userData.data_timestamp)
        console.log('✅ 服务器时间:', data.server_time)
        
        // 确保数据新鲜度
        if (data.server_time) {
          const serverTime = new Date(data.timestamp || Date.now())
          const clientTime = new Date()
          const timeDiff = Math.abs(clientTime.getTime() - serverTime.getTime())
          console.log('⏰ 服务器时间差:', timeDiff, 'ms')
        }
        
        setProfile(userData)
        setEditedProfile(userData)
        console.log('✅ 个人资料已加载到状态中')
      } else {
        console.error('❌ 获取个人资料失败:', response.status)
        const errorData = await response.json()
        console.error('❌ 错误详情:', errorData)
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

      console.log('🔄 开始保存个人资料...', new Date().toISOString())
      console.log('📝 编辑的数据:', editedProfile)
      console.log('📝 bio字段值:', editedProfile.bio)
      console.log('📝 location字段值:', editedProfile.location)

      // 创建更强的缓存绕过参数
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
          // 添加更多强制刷新头部
          'X-Requested-With': 'XMLHttpRequest',
          'X-Force-Refresh': 'true',
          'X-Cache-Bypass': 'true',
          'X-Timestamp': timestamp.toString(),
          'X-Update-ID': `update-${timestamp}-${randomId}`,
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        },
        body: JSON.stringify({
          ...editedProfile,
          // 添加客户端时间戳确保数据唯一性
          client_timestamp: new Date().toISOString(),
          update_id: `client-${timestamp}-${randomId}`
        })
      })

      console.log('📡 API响应状态:', response.status)
      console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const updatedResponse = await response.json()
        console.log('✅ 更新个人资料响应:', updatedResponse)
        
        // 验证更新结果
        const updatedUserData = updatedResponse.user || updatedResponse
        console.log('✅ 更新后的用户数据:', updatedUserData)
        console.log('✅ 更新后的bio字段:', updatedUserData.bio)
        console.log('✅ 更新确认:', updatedUserData.update_confirmed)
        console.log('✅ 更新时间:', updatedUserData.confirmed_at)
        
        setProfile(updatedUserData)
        setEditedProfile(updatedUserData)
        setIsEditing(false)
        
        // 强制重新获取数据验证保存效果
        setTimeout(() => {
          console.log('🔄 验证保存效果...')
          fetchProfile()
        }, 500)
        
        console.log('✅ 个人资料保存成功，状态已更新')
      } else {
        console.error('❌ 更新个人资料失败:', response.status)
        const errorData = await response.json()
        console.error('❌ 错误详情:', errorData)
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

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true)
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔄 开始上传头像...', new Date().toISOString())
      console.log('📁 文件信息:', { name: file.name, size: file.size, type: file.type })

      const formData = new FormData()
      formData.append('avatar', file)

      // 创建更强的缓存绕过参数
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

      console.log('📡 头像上传API响应状态:', response.status)
      console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 头像上传成功:', data)
        
        // 更新本地状态
        if (profile) {
          const updatedProfile = { ...profile, avatar_url: data.avatar_url }
          setProfile(updatedProfile)
          setEditedProfile(updatedProfile)
        }
        
        console.log('✅ 头像已更新到状态中')
      } else {
        console.error('❌ 头像上传失败:', response.status)
        const errorData = await response.json()
        console.error('❌ 错误详情:', errorData)
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
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>编辑资料</span>
                </button>
                <button
                  onClick={fetchProfile}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  🔄 刷新
                </button>
              </>
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
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden relative">
                {profile.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    width={128}
                    height={128}
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
                
                {/* 头像上传按钮 */}
                <button
                  onClick={triggerFileInput}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                  title="上传头像"
                >
                  {isUploadingAvatar ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            {/* 上传提示 */}
            {isUploadingAvatar && (
              <div className="text-sm text-gray-500 mb-2">
                正在上传头像...
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
            <p className="text-gray-600 mb-6">{profile.email}</p>
          </div>

          {/* 完整资料信息 */}
          <div className="space-y-6">
            {/* 个人简介 */}
            <div>
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

            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 年龄 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  年龄
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {profile.birth_date ? 
                    `${Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}岁` : 
                    '未设置'
                  }
                </p>
              </div>

              {/* 身高 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="h-4 w-4 mr-2" />
                  身高
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedProfile.height || ''}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="身高(cm)"
                    min="100"
                    max="250"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.height ? `${profile.height}cm` : '未设置'}
                  </p>
                )}
              </div>



              {/* 宗教 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="h-4 w-4 mr-2" />
                  宗教
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.religion || ''}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择宗教</option>
                    <option value="无宗教信仰">无宗教信仰</option>
                    <option value="基督教">基督教</option>
                    <option value="天主教">天主教</option>
                    <option value="伊斯兰教">伊斯兰教</option>
                    <option value="佛教">佛教</option>
                    <option value="印度教">印度教</option>
                    <option value="犹太教">犹太教</option>
                    <option value="其他">其他</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.religion || '未设置'}
                  </p>
                )}
              </div>

              {/* 雇主 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 mr-2" />
                  雇主
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.employer || ''}
                    onChange={(e) => handleInputChange('employer', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="你的雇主"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.employer || '未设置'}
                  </p>
                )}
              </div>

              {/* 位置 */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    位置
                  </div>
                  <button
                    onClick={() => window.open('/location-settings', '_blank')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    title="位置权限设置"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    位置设置
                  </button>
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

              {/* 学校 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  学校
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.school || ''}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="你的学校"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.school || '未设置'}
                  </p>
                )}
              </div>

              {/* 学位 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  学位
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.degree || ''}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择学位</option>
                    <option value="博士">博士</option>
                    <option value="硕士">硕士</option>
                    <option value="本科">本科</option>
                    <option value="非本科（大专/自考）">非本科（大专/自考）</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.degree || '未设置'}
                  </p>
                )}
              </div>

              {/* 价值观 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Heart className="h-4 w-4 mr-2" />
                  价值观
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      // 价值观ID到中文名称的映射
                      const valueMap: { [key: string]: string } = {
                        'ambition': '有上进心',
                        'confidence': '自信',
                        'curiosity': '好奇心',
                        'emotional_intelligence': '高情商',
                        'empathy': '同理心',
                        'generosity': '大方',
                        'gratitude': '感恩',
                        'humility': '谦逊',
                        'humor': '幽默',
                        'kindness': '善良',
                        'leadership': '领导力',
                        'loyalty': '忠诚',
                        'openness': '开放',
                        'optimism': '乐观',
                        'playfulness': '有趣',
                        'sassiness': '活泼'
                      }
                      
                      const currentValues = editedProfile.values_preferences || []
                      
                      if (currentValues.length > 0) {
                        return currentValues.map((value, index) => (
                          <div key={index} className="flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm">
                            <span className="text-gray-900 truncate">{valueMap[value] || value}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newValues = currentValues.filter((_, i) => i !== index)
                                handleInputChange('values_preferences', newValues)
                              }}
                              className="text-red-500 hover:text-red-700 text-xs ml-1 hover:bg-red-50 rounded-full px-1 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      } else {
                        return (
                          <div className="col-span-3">
                            <p className="text-gray-500 italic px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-center">
                              暂无选择的价值观
                            </p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {(() => {
                      // 价值观ID到中文名称的映射
                      const valueMap: { [key: string]: string } = {
                        'ambition': '有上进心',
                        'confidence': '自信',
                        'curiosity': '好奇心',
                        'emotional_intelligence': '高情商',
                        'empathy': '同理心',
                        'generosity': '大方',
                        'gratitude': '感恩',
                        'humility': '谦逊',
                        'humor': '幽默',
                        'kindness': '善良',
                        'leadership': '领导力',
                        'loyalty': '忠诚',
                        'openness': '开放',
                        'optimism': '乐观',
                        'playfulness': '有趣',
                        'sassiness': '活泼'
                      }
                      
                      if (profile.values_preferences && profile.values_preferences.length > 0) {
                        const translatedValues = profile.values_preferences.map(value => 
                          valueMap[value] || value
                        )
                        return translatedValues.join(', ')
                      }
                      return '未设置'
                    })()}
                  </p>
                )}
              </div>



              {/* 兴趣 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Heart className="h-4 w-4 mr-2" />
                  兴趣
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      // 兴趣ID到中文名称的映射
                      const interestMap: { [key: string]: string } = {
                        'baking': '🍰 烘焙',
                        'lgbtq_rights': '🏳️‍🌈 LGBTQ+',
                        'hiking': '⛰️ 徒步',
                        'gardening': '🌱 园艺',
                        'rnb': '🎵 音乐',
                        'art': '🎨 艺术',
                        'writing': '📝 写作',
                        'country': '🖼️ 绘画',
                        'skiing': '📚 阅读',
                        'museums': '🏛️ 博物馆',
                        'vegetarian': '🥦 素食',
                        'horror': '📺 电影',
                        'dancing': '💃 跳舞',
                        'yoga': '🧘 瑜伽',
                        'dogs': '🐶 狗',
                        'crafts': '🧷 手工艺',
                        'festivals': '🎉 节日',
                        'tennis': '🎾 运动',
                        'cats': '🐱 猫',
                        'concerts': '🎟️ 音乐会',
                        'foodie': '🍜 美食',
                        'exploring_cities': '🏙️ 旅游',
                        'camping': '⛺ 露营',
                        'wine': '🍷 葡萄酒',
                        'feminism': '💛 女权主义',
                        'coffee': '☕ 咖啡',
                        'gaming': '🎮 游戏'
                      }
                      
                      const currentInterests = editedProfile.interests || []
                      
                      if (currentInterests.length > 0) {
                        return currentInterests.map((interest, index) => (
                          <div key={index} className="flex items-center justify-between px-2 py-1 border border-gray-300 rounded-md bg-white text-sm">
                            <span className="text-gray-900 truncate">{interestMap[interest] || interest}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newInterests = currentInterests.filter((_, i) => i !== index)
                                handleInputChange('interests', newInterests)
                              }}
                              className="text-red-500 hover:text-red-700 text-xs ml-1 hover:bg-red-50 rounded-full px-1 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      } else {
                        return (
                          <div className="col-span-3">
                            <p className="text-gray-500 italic px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-center">
                              暂无选择的兴趣
                            </p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {(() => {
                      // 兴趣ID到中文名称的映射
                      const interestMap: { [key: string]: string } = {
                        'baking': '🍰 烘焙',
                        'lgbtq_rights': '🏳️‍🌈 LGBTQ+',
                        'hiking': '⛰️ 徒步',
                        'gardening': '🌱 园艺',
                        'rnb': '🎵 音乐',
                        'art': '🎨 艺术',
                        'writing': '📝 写作',
                        'country': '🖼️ 绘画',
                        'skiing': '📚 阅读',
                        'museums': '🏛️ 博物馆',
                        'vegetarian': '🥦 素食',
                        'horror': '📺 电影',
                        'dancing': '💃 跳舞',
                        'yoga': '🧘 瑜伽',
                        'dogs': '🐶 狗',
                        'crafts': '🧷 手工艺',
                        'festivals': '🎉 节日',
                        'tennis': '🎾 运动',
                        'cats': '🐱 猫',
                        'concerts': '🎟️ 音乐会',
                        'foodie': '🍜 美食',
                        'exploring_cities': '🏙️ 旅游',
                        'camping': '⛺ 露营',
                        'wine': '🍷 葡萄酒',
                        'feminism': '💛 女权主义',
                        'coffee': '☕ 咖啡',
                        'gaming': '🎮 游戏'
                      }
                      
                      if (profile.interests && profile.interests.length > 0) {
                        const translatedInterests = profile.interests.map(interest => 
                          interestMap[interest] || interest
                        )
                        return translatedInterests.join(', ')
                      }
                      return '未设置'
                    })()}
                  </p>
                )}
              </div>

              {/* 关系状态 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Heart className="h-4 w-4 mr-2" />
                  关系状态
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.relationship_status || ''}
                    onChange={(e) => handleInputChange('relationship_status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择状态</option>
                    <option value="单身">单身</option>
                    <option value="恋爱中">恋爱中</option>
                    <option value="已婚">已婚</option>
                    <option value="离异">离异</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.relationship_status || '未设置'}
                  </p>
                )}
              </div>

              {/* 家庭计划 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Baby className="h-4 w-4 mr-2" />
                  家庭计划
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.family_plans || ''}
                    onChange={(e) => handleInputChange('family_plans', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择计划</option>
                    <option value="dont_want_kids">不想要孩子</option>
                    <option value="open_to_kids">对孩子持开放态度</option>
                    <option value="want_kids">想要孩子</option>
                    <option value="not_sure">不确定</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
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
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Baby className="h-4 w-4 mr-2" />
                  孩子
                </label>
                {isEditing ? (
                  <select
                    value={typeof editedProfile.has_kids === 'string' ? editedProfile.has_kids : ''}
                    onChange={(e) => handleInputChange('has_kids', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择状态</option>
                    <option value="dont_have_kids">没有孩子</option>
                    <option value="have_kids">有孩子</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {(() => {
                      const hasKidsMap: { [key: string]: string } = {
                        'dont_have_kids': '没有孩子',
                        'have_kids': '有孩子'
                      }
                      return hasKidsMap[profile.has_kids as string || ''] || (profile.has_kids ? '有孩子' : '没有孩子')
                    })()}
                  </p>
                )}
              </div>

              {/* 吸烟 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Coffee className="h-4 w-4 mr-2" />
                  吸烟
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.smoking_status || ''}
                    onChange={(e) => handleInputChange('smoking_status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择状态</option>
                    <option value="yes_smoke">是的，我吸烟</option>
                    <option value="sometimes_smoke">我有时吸烟</option>
                    <option value="no_smoke">不，我不吸烟</option>
                    <option value="trying_quit">我正在尝试戒烟</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
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
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Wine className="h-4 w-4 mr-2" />
                  饮酒
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.drinking_status || ''}
                    onChange={(e) => handleInputChange('drinking_status', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择状态</option>
                    <option value="yes_drink">是的，我喝酒</option>
                    <option value="sometimes_drink">我有时喝酒</option>
                    <option value="rarely_drink">我很少喝酒</option>
                    <option value="no_drink">不，我不喝酒</option>
                    <option value="sober">我戒酒了</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
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

              {/* 约会风格 */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  约会风格
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.dating_style || ''}
                    onChange={(e) => handleInputChange('dating_style', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">选择风格</option>
                    <option value="long_term">长期关系</option>
                    <option value="life_partner">人生伴侣</option>
                    <option value="casual_dates">有趣的随意约会</option>
                    <option value="intimacy_no_commitment">肉体关系</option>
                    <option value="marriage">婚姻</option>
                    <option value="ethical_non_monogamy">开放式关系</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {(() => {
                      const datingStyleMap: { [key: string]: string } = {
                        'long_term': '长期关系',
                        'life_partner': '人生伴侣',
                        'casual_dates': '有趣的随意约会',
                        'intimacy_no_commitment': '肉体关系',
                        'marriage': '婚姻',
                        'ethical_non_monogamy': '开放式关系'
                      }
                      return datingStyleMap[profile.dating_style || ''] || profile.dating_style || '未设置'
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 