'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Info, Check, Eye } from 'lucide-react'

export default function DatingPreferences() {
  const [openToEveryone, setOpenToEveryone] = useState(false)
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 从localStorage获取用户信息
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.name || user.first_name || '用户')
      } catch (error) {
        console.error('解析用户信息失败:', error)
        setUserName('用户')
      }
    }
  }, [])

  const handleToggleEveryone = () => {
    if (isConfirmed) return // 如果已确认，不允许更改
    setOpenToEveryone(!openToEveryone)
    if (!openToEveryone) {
      // 如果开启"约会所有人"，清空其他选择
      setSelectedGenders([])
    }
  }

  const handleGenderSelect = (gender: string) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    if (openToEveryone) return // 如果选择了"约会所有人"，不允许单独选择

    setSelectedGenders(prev => {
      if (prev.includes(gender)) {
        return prev.filter(g => g !== gender)
      } else {
        return [...prev, gender]
      }
    })
  }

  const handleConfirm = async () => {
    if (!openToEveryone && selectedGenders.length === 0) {
      alert('请选择您想要约会的对象')
      return
    }

    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户约会偏好信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            dating_preferences: openToEveryone ? ['everyone'] : selectedGenders
          })
        })

        if (!response.ok) {
          console.error('更新约会偏好信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('处理约会偏好选择时出错:', error)
      // 即使出错也继续跳转
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center">
          {/* 左侧留空 */}
        </div>
        <div className="flex items-center">
          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ConnectEd Elite Social Club
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full h-1 bg-gray-200">
        <div className="w-full h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            您想认识谁？
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            您可以选择多个答案，并且随时可以更改。
          </p>
        </div>

        {/* 约会所有人开关 */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg">
            <span className="text-base font-medium text-black">
              我对约会所有人持开放态度
            </span>
            <button
              onClick={handleToggleEveryone}
              disabled={isConfirmed}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                openToEveryone ? 'bg-black' : 'bg-gray-300'
              } ${isConfirmed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  openToEveryone ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 性别选择选项 */}
        <div className="mb-8">
          <div className="space-y-3">
            {/* 男性选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGenders.includes('male') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed || openToEveryone
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('male')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">男性</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGenders.includes('male') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGenders.includes('male') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 女性选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGenders.includes('female') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed || openToEveryone
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('female')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">女性</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGenders.includes('female') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGenders.includes('female') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 非二元性别选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGenders.includes('nonbinary') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed || openToEveryone
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('nonbinary')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">非二元性别</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGenders.includes('nonbinary') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGenders.includes('nonbinary') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 信息提示 */}
        <div className="mb-8">
          <div className="flex items-start space-x-2">
            <Eye className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              您只会看到想要约会您性别的人。
            </div>
          </div>
        </div>

        {/* 确认按钮 */}
        {!isConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={!openToEveryone && selectedGenders.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              openToEveryone || selectedGenders.length > 0
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            确认选择
          </button>
        )}

        {/* 确认状态 */}
        {isConfirmed && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">
              约会偏好已保存，正在跳转...
            </p>
          </div>
        )}
      </div>

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 