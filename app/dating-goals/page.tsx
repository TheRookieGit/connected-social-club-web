'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Info, Check, Eye } from 'lucide-react'

export default function DatingGoals() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
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

  const handleGoalSelect = (goal: string) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        return prev.filter(g => g !== goal)
      } else {
        // 限制最多选择2个选项
        if (prev.length >= 2) {
          return prev
        }
        return [...prev, goal]
      }
    })
  }

  const handleConfirm = async () => {
    if (selectedGoals.length === 0) {
      alert('请至少选择一个您希望找到的目标')
      return
    }

    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户约会目标信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            dating_goals: selectedGoals
          })
        })

        if (!response.ok) {
          console.error('更新约会目标信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('处理约会目标选择时出错:', error)
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
            您希望找到什么？
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            这是您的约会旅程，所以选择1或2个对您来说感觉正确的选项。
          </p>
        </div>

        {/* 约会目标选择 */}
        <div className="mb-8">
          <div className="space-y-3">
            {/* 长期关系 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGoals.includes('long_term') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGoalSelect('long_term')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">长期关系</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGoals.includes('long_term') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGoals.includes('long_term') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 人生伴侣 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGoals.includes('life_partner') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGoalSelect('life_partner')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">人生伴侣</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGoals.includes('life_partner') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGoals.includes('life_partner') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 有趣的随意约会 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGoals.includes('casual_dates') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGoalSelect('casual_dates')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">有趣的随意约会</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGoals.includes('casual_dates') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGoals.includes('casual_dates') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 亲密关系，无需承诺 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGoals.includes('intimacy_no_commitment') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGoalSelect('intimacy_no_commitment')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">亲密关系，无需承诺</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGoals.includes('intimacy_no_commitment') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGoals.includes('intimacy_no_commitment') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 婚姻 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGoals.includes('marriage') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGoalSelect('marriage')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">婚姻</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGoals.includes('marriage') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGoals.includes('marriage') && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 道德非一夫一妻制 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedGoals.includes('ethical_non_monogamy') 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleGoalSelect('ethical_non_monogamy')}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-black">道德非一夫一妻制</span>
                <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedGoals.includes('ethical_non_monogamy') 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedGoals.includes('ethical_non_monogamy') && (
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
              这将显示在您的个人资料上，以帮助每个人找到他们正在寻找的东西。
            </div>
          </div>
        </div>

        {/* 确认按钮 */}
        {!isConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={selectedGoals.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              selectedGoals.length > 0
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
              约会目标已保存，正在跳转...
            </p>
          </div>
        )}
      </div>

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 