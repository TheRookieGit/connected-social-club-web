'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Info, Check } from 'lucide-react'

export default function Lifestyle() {
  const [drinkingHabit, setDrinkingHabit] = useState<string>('')
  const [smokingHabit, setSmokingHabit] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  // 防止后退功能
  useEffect(() => {
    // 在页面加载时立即添加历史记录，防止直接后退
    window.history.pushState(null, '', '/lifestyle')

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果用户已经选择了生活方式，就阻止离开页面
      if (drinkingHabit || smokingHabit) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // 如果用户已经选择了生活方式，阻止后退
      if (drinkingHabit || smokingHabit) {
        // 阻止默认的后退行为
        e.preventDefault()
        // 立即重新添加当前页面到历史记录
        window.history.pushState(null, '', '/lifestyle')
        // 显示提示信息
        alert('请完成当前页面的选择后再继续')
        // 强制阻止导航
        return false
      }
    }

    // 监听浏览器后退按钮
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && (drinkingHabit || smokingHabit)) {
        e.preventDefault()
        alert('请完成当前页面的选择后再继续')
        return false
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [drinkingHabit, smokingHabit])

  // 饮酒习惯选项
  const drinkingOptions = [
    { id: 'yes_drink', name: '是的，我喝酒' },
    { id: 'sometimes_drink', name: '我有时喝酒' },
    { id: 'rarely_drink', name: '我很少喝酒' },
    { id: 'no_drink', name: '不，我不喝酒' },
    { id: 'sober', name: '我戒酒了' }
  ]

  // 吸烟习惯选项
  const smokingOptions = [
    { id: 'yes_smoke', name: '是的，我吸烟' },
    { id: 'sometimes_smoke', name: '我有时吸烟' },
    { id: 'no_smoke', name: '不，我不吸烟' },
    { id: 'trying_quit', name: '我正在尝试戒烟' }
  ]

  const handleDrinkingSelect = (optionId: string) => {
    if (isConfirmed) return
    setDrinkingHabit(optionId)
  }

  const handleSmokingSelect = (optionId: string) => {
    if (isConfirmed) return
    setSmokingHabit(optionId)
  }

  const handleConfirm = async () => {
    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户生活习惯信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            drinking_status: drinkingHabit,
            smoking_status: smokingHabit
          })
        })

        if (!response.ok) {
          console.error('更新生活习惯信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/family-plans')
      }, 1500)
    } catch (error) {
      console.error('处理生活习惯选择时出错:', error)
      // 即使出错也继续跳转
      setTimeout(() => {
        router.push('/family-plans')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/family-plans')
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
        <div className="w-[80%] h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            让我们谈谈您的生活习惯
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            分享您愿意分享的关于您习惯的信息。
          </p>
        </div>

        {/* 饮酒习惯选择 */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-black mb-4">饮酒</h3>
          <div className="grid grid-cols-2 gap-3">
            {drinkingOptions.map((option) => (
              <div
                key={option.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  drinkingHabit === option.id
                    ? 'bg-pink-100 border-black'
                    : isConfirmed
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleDrinkingSelect(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">{option.name}</span>
                  <div className={`w-4 h-4 border-2 flex items-center justify-center ${
                    drinkingHabit === option.id
                      ? 'bg-black border-black'
                      : 'border-black'
                  }`}>
                    {drinkingHabit === option.id && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 吸烟习惯选择 */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-black mb-4">吸烟</h3>
          <div className="grid grid-cols-2 gap-3">
            {smokingOptions.map((option) => (
              <div
                key={option.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  smokingHabit === option.id
                    ? 'bg-pink-100 border-black'
                    : isConfirmed
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleSmokingSelect(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">{option.name}</span>
                  <div className={`w-4 h-4 border-2 flex items-center justify-center ${
                    smokingHabit === option.id
                      ? 'bg-black border-black'
                      : 'border-black'
                  }`}>
                    {smokingHabit === option.id && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* 跳过按钮 */}
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            跳过
          </button>

          {/* 下一步按钮 */}
          <button
            onClick={handleConfirm}
            disabled={isConfirmed}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isConfirmed
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 确认状态 */}
      {isConfirmed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">
              生活习惯已保存，正在跳转...
            </p>
          </div>
        </div>
      )}

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 