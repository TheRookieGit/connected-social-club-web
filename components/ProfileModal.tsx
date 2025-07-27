'use client'

import { useState, useEffect } from 'react'
import { X, Camera, Edit, Save } from 'lucide-react'
import { User } from '@/types/user'
import { useProfile } from '@/lib/hooks'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState<Partial<any>>({})

  // 获取用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        console.log('ProfileModal: 开始获取用户资料...')
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('ProfileModal: 获取到用户资料:', data.user)
            setProfile(data.user)
            setEditForm(data.user)
          } else {
            console.error('ProfileModal: 获取用户资料失败:', data.error)
          }
        } else {
          console.error('ProfileModal: 获取用户资料请求失败:', response.status)
        }
      } catch (error) {
        console.error('ProfileModal: 获取用户资料异常:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    if (!profile) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('前端发送的数据:', editForm)
      console.log('bio字段值:', editForm.bio)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 保存成功后，重新获取最新的用户资料
          console.log('保存成功，重新获取用户资料...')
          const refreshResponse = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            if (refreshData.success) {
              console.log('获取到的最新数据:', refreshData.user)
              setProfile(refreshData.user)
              setEditForm(refreshData.user)
            }
          }
          
          setIsEditing(false)
          alert('保存成功！')
        } else {
          alert(data.error || '保存失败')
        }
      } else {
        alert('保存失败，请稍后重试')
      }
    } catch (error) {
      console.error('保存用户资料失败:', error)
      alert('保存失败，请稍后重试')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm(profile)
    }
    setIsEditing(false)
  }

  const addInterest = (interest: string) => {
    if (interest.trim()) {
      const currentInterests = editForm.interests || []
      if (!currentInterests.includes(interest.trim())) {
        setEditForm((prev: any) => ({
          ...prev,
          interests: [...currentInterests, interest.trim()]
        }))
      }
    }
  }

  const removeInterest = (index: number) => {
    const currentInterests = editForm.interests || []
    setEditForm(prev => ({
      ...prev,
      interests: currentInterests.filter((_: any, i: number) => i !== index)
    }))
  }

  // 计算年龄
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

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
            <p className="text-gray-600">无法加载用户资料</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              关闭
            </button>
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
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>编辑</span>
                </button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token')
                    if (!token) return
                    
                    const response = await fetch('/api/user/profile', {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    
                    if (response.ok) {
                      const data = await response.json()
                      if (data.success) {
                        setProfile(data.user)
                        setEditForm(data.user)
                        alert('数据已刷新！')
                      }
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <span>刷新</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 头像区域 */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-red-500">
                  {profile.name.charAt(0)}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">基本信息</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年龄
                </label>
                <p className="text-gray-900">{calculateAge(profile.birth_date)}岁</p>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所在地
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.location || '未设置'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            {isEditing ? (
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="介绍一下你自己..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{profile.bio || '这个人很神秘...'}</p>
            )}
          </div>

          {/* 兴趣爱好 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              兴趣爱好
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(editForm.interests || []).map((interest: any, index: number) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="添加兴趣..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addInterest(input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.interests || []).map((interest: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 隐私设置 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">隐私设置</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">个人资料可见性</p>
                  <p className="text-sm text-gray-500">控制谁可以看到你的个人资料</p>
                </div>
                <select className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option>所有人</option>
                  <option>仅匹配用户</option>
                  <option>仅好友</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">在线状态</p>
                  <p className="text-sm text-gray-500">显示你的在线状态</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 