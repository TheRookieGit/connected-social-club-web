'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, AlertCircle, Check, X } from 'lucide-react'
import { UserProfile, ProfileOptions } from '@/types/user'
import ProfileFieldEditor from '@/components/ProfileFieldEditor'

export default function ProfileEditPage() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'photos' | 'details'>('details')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingField, setEditingField] = useState<{
    label: string
    value: any
    type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number'
    options?: string[]
    required?: boolean
    key: string
  } | null>(null)
  const [options, setOptions] = useState<ProfileOptions>({
    ethnicities: ['亚洲人', '白人', '黑人', '拉丁裔', '中东人', '混血', '其他'],
    religions: ['无宗教信仰', '基督教', '天主教', '伊斯兰教', '佛教', '印度教', '犹太教', '其他'],
    personality_types: ['内向', '外向', '内向偏外向', '外向偏内向'],
    exercise_frequencies: ['每天', '每周几次', '每月几次', '很少', '从不'],
    smoking_statuses: ['从不', '偶尔', '经常', '正在戒烟'],
    drinking_statuses: ['从不', '偶尔', '经常', '仅社交场合'],
    dating_styles: ['随意', '认真', '以结婚为目的', '先做朋友'],
    family_plans: ['想要孩子', '对孩子开放', '不想要孩子', '已有孩子'],
    marital_statuses: ['单身', '离异', '丧偶', '分居'],
    relationship_statuses: ['单身', '恋爱中', '已婚', '离异'],
    languages: ['中文', '英语', '日语', '韩语', '法语', '德语', '西班牙语', '其他'],
    values: ['家庭', '事业', '健康', '教育', '旅行', '艺术', '运动', '音乐', '阅读', '美食'],
    interests: ['旅行', '音乐', '电影', '阅读', '运动', '美食', '摄影', '艺术', '科技', '时尚']
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('未找到登录令牌')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else {
        console.error('加载资料失败')
      }
    } catch (error) {
      console.error('加载资料错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        return true
      } else {
        console.error('更新失败')
        return false
      }
    } catch (error) {
      console.error('更新错误:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  const getFieldStatus = (value: any, required: boolean = false) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return required ? 'missing' : 'empty'
    }
    return 'filled'
  }

  const handleFieldEdit = (field: {
    label: string
    value: any
    type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number'
    options?: string[]
    required?: boolean
    key: string
  }) => {
    setEditingField(field)
  }

  const handleFieldSave = async (value: any) => {
    if (!editingField || !profile) return false

    const updates: any = {}
    updates[editingField.key] = value

    const success = await updateProfile(updates)
    if (success) {
      setEditingField(null)
    }
    return success || false
  }

  const renderField = (
    label: string,
    value: any,
    type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number',
    key: string,
    options?: string[],
    required: boolean = false
  ) => {
    const status = getFieldStatus(value, required)
    
    return (
      <div 
        className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={() => handleFieldEdit({
          label,
          value,
          type,
          options,
          required,
          key
        })}
      >
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">{label}</span>
          {status === 'missing' && (
            <div className="flex items-center space-x-1 text-red-500">
              <AlertCircle size={16} />
              <span className="text-sm">添加缺失详情</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">
            {status === 'filled' ? (
              Array.isArray(value) ? value.join(', ') : value
            ) : (
              status === 'missing' ? '' : '—'
            )}
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">编辑资料</h1>
          <button 
            className="text-red-500 font-medium"
            onClick={() => window.history.back()}
          >
            完成
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'prompts' 
              ? 'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('prompts')}
        >
          提示
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'photos' 
              ? 'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('photos')}
        >
          照片
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'details' 
              ? 'text-red-500 border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('details')}
        >
          详情
        </button>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-6">
        {activeTab === 'details' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">公开资料</h2>
            
            <div className="space-y-1">
              {/* 基础信息 */}
              {renderField('年龄', profile?.birth_date ? 
                Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null, 
                'number', 'birth_date', undefined, true
              )}
              
              {renderField('身高', profile?.height ? `${profile.height}cm` : null, 'number', 'height', undefined, false)}
              
              {renderField('种族', profile?.ethnicity, 'select', 'ethnicity', options.ethnicities, true)}
              
              {renderField('宗教', profile?.religion, 'select', 'religion', options.religions, true)}
              
              {renderField('雇主', profile?.employer, 'text', 'employer', undefined, false)}
              
              {renderField('位置', profile?.location, 'text', 'location', undefined, false)}
              
              {renderField('职业', profile?.occupation, 'text', 'occupation', undefined, true)}
              
              {renderField('学校', profile?.school, 'text', 'school', undefined, true)}
              
              {renderField('学位', profile?.degree, 'text', 'degree', undefined, true)}
              
              {renderField('价值观', profile?.values_preferences, 'multiselect', 'values_preferences', options.values, false)}
              
              {renderField('性格', profile?.personality_type, 'select', 'personality_type', options.personality_types, false)}
              
              {renderField('兴趣', profile?.interests, 'multiselect', 'interests', options.interests, false)}
              
              {renderField('家乡', profile?.hometown, 'text', 'hometown', undefined, false)}
              
              {renderField('语言', profile?.languages, 'multiselect', 'languages', options.languages, false)}
              
              {renderField('关系状态', profile?.relationship_status, 'select', 'relationship_status', options.relationship_statuses, false)}
              
              {renderField('家庭计划', profile?.family_plans, 'select', 'family_plans', options.family_plans, false)}
              
              {renderField('孩子', profile?.has_kids ? '有孩子' : '没有孩子', 'boolean', 'has_kids', undefined, false)}
              
              {renderField('婚姻状况', profile?.marital_status, 'select', 'marital_status', options.marital_statuses, false)}
              
              {renderField('运动', profile?.exercise_frequency, 'select', 'exercise_frequency', options.exercise_frequencies, false)}
              
              {renderField('吸烟', profile?.smoking_status, 'select', 'smoking_status', options.smoking_statuses, false)}
              
              {renderField('饮酒', profile?.drinking_status, 'select', 'drinking_status', options.drinking_statuses, false)}
              
              {renderField('约会风格', profile?.dating_style, 'select', 'dating_style', options.dating_styles, false)}
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="text-center py-12">
            <p className="text-gray-500">提示功能开发中...</p>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="text-center py-12">
            <p className="text-gray-500">照片功能开发中...</p>
          </div>
                 )}
       </div>

       {/* 字段编辑模态框 */}
       {editingField && (
         <ProfileFieldEditor
           isOpen={!!editingField}
           onClose={() => setEditingField(null)}
           field={editingField}
           onSave={handleFieldSave}
         />
       )}
     </div>
   )
 } 