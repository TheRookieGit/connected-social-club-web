'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'

export default function GenderSelection() {
  const [selectedGender, setSelectedGender] = useState('')
  const [showMoreDetails, setShowMoreDetails] = useState(false)
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
    setSelectedGender(gender)
  }

  const handleContinue = async () => {
    if (!selectedGender) {
      alert('请选择您的生理性别')
      return
    }

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

      // 跳转到下一个页面或仪表板
      router.push('/dashboard')
    } catch (error) {
      console.error('处理性别选择时出错:', error)
      // 即使出错也继续跳转
      router.push('/dashboard')
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
      <div className="px-6 py-8">
        {/* 标题和介绍 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            {userName} 是一个很棒的名字
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            我们很高兴您来到这里。选择最能描述您的生理性别，如果您愿意的话，可以添加更多相关信息。
          </p>
        </div>

        {/* 性别选择 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-4">
            哪个生理性别最能描述您？
          </h2>
          
          <div className="space-y-3">
            {/* 女性选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGender === 'female' 
                  ? 'bg-yellow-400 border-yellow-400' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('female')}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-black">女性</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedGender === 'female' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGender === 'female' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              
              {/* 更多详情选项 */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoreDetails(!showMoreDetails)
                  }}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  添加更多关于您的性别信息
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                    showMoreDetails ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>

            {/* 男性选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGender === 'male' 
                  ? 'bg-yellow-400 border-yellow-400' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('male')}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-black">男性</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedGender === 'male' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGender === 'male' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* 非二元性别选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGender === 'nonbinary' 
                  ? 'bg-yellow-400 border-yellow-400' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGenderSelect('nonbinary')}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-black">非二元性别</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedGender === 'nonbinary' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGender === 'nonbinary' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 信息提示 */}
        <div className="mb-8">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              您可以随时更新此信息。
              <button className="text-black underline hover:no-underline">
                关于社交俱乐部中性别设置的说明
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部继续按钮 */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleContinue}
          disabled={!selectedGender || isLoading}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            selectedGender && !isLoading
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ChevronRight className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 