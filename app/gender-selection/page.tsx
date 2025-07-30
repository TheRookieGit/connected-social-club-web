'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Info, Check } from 'lucide-react'

export default function GenderSelection() {
  const [selectedGender, setSelectedGender] = useState('')
  const [showMoreDetails, setShowMoreDetails] = useState(false)
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

  const handleGenderSelect = (gender: string) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    setSelectedGender(gender)
  }

  const handleConfirm = async () => {
    if (!selectedGender) {
      alert('请选择您的生理性别')
      return
    }

    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户性别信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            gender: selectedGender
          })
        })

        if (!response.ok) {
          console.error('更新性别信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('处理性别选择时出错:', error)
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
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">7:09</span>
          <div className="w-4 h-4 text-black">❤️</div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-3 bg-black rounded-sm"></div>
          <div className="w-4 h-3 bg-black rounded-sm"></div>
          <div className="w-4 h-3 bg-black rounded-sm"></div>
          <div className="w-4 h-3 bg-black rounded-sm"></div>
          <div className="w-6 h-3 bg-black rounded-sm"></div>
          <div className="w-4 h-3 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-full h-1 bg-gray-200">
        <div className="w-1/4 h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            {userName} 是一个很棒的名字
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            我们很高兴您来到这里。请选择您的生理性别。
          </p>
        </div>

        {/* 性别选择 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-4 text-center">
            哪个生理性别最能描述您？
          </h2>
          
          <div className="space-y-2">
            {/* 女性选项 */}
            <div 
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGender === 'female' 
                  ? 'bg-yellow-400 border-yellow-400' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('female')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">女性</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedGender === 'female' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGender === 'female' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              
              {/* 更多详情选项 - 只在选中时显示 */}
              {selectedGender === 'female' && !isConfirmed && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMoreDetails(!showMoreDetails)
                    }}
                    className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                  >
                    添加更多关于您的性别信息
                    <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${
                      showMoreDetails ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              )}
            </div>

            {/* 男性选项 */}
            <div 
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGender === 'male' 
                  ? 'bg-yellow-400 border-yellow-400' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('male')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">男性</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedGender === 'male' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGender === 'male' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 非二元性别选项 */}
            <div 
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGender === 'nonbinary' 
                  ? 'bg-yellow-400 border-yellow-400' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('nonbinary')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">非二元性别</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedGender === 'nonbinary' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGender === 'nonbinary' && (
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
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              您可以随时更新此信息。
              <button className="text-black underline hover:no-underline">
                关于社交俱乐部中性别设置的说明
              </button>
            </div>
          </div>
        </div>

        {/* 确认按钮 */}
        {!isConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={!selectedGender}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              selectedGender
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
              性别信息已保存，正在跳转...
            </p>
          </div>
        )}
      </div>

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 