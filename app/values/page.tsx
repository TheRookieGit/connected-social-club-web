'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Search, Check, Eye } from 'lucide-react'

export default function Values() {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  // 防止后退功能
  useEffect(() => {
    // 在页面加载时立即添加历史记录，防止直接后退
    window.history.pushState(null, '', '/values')

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果用户已经选择了价值观，就阻止离开页面
      if (selectedValues.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // 如果用户已经选择了价值观，阻止后退
      if (selectedValues.length > 0) {
        // 阻止默认的后退行为
        e.preventDefault()
        // 立即重新添加当前页面到历史记录
        window.history.pushState(null, '', '/values')
        // 显示提示信息
        alert('请完成当前页面的选择后再继续')
        // 强制阻止导航
        return false
      }
    }

    // 监听浏览器后退按钮
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && selectedValues.length > 0) {
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
  }, [selectedValues])

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

  const handleValueSelect = (valueId: string) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    
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

  const handleConfirm = async () => {
    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户品质偏好信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            values_preferences: selectedValues
          })
        })

        if (!response.ok) {
          console.error('更新品质偏好信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/lifestyle')
      }, 1500)
    } catch (error) {
      console.error('处理品质选择时出错:', error)
      // 即使出错也继续跳转
      setTimeout(() => {
        router.push('/lifestyle')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/lifestyle')
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
        <div className="w-[70%] h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            我希望你是...
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            选择3个你希望伴侣拥有的品质，让匹配更加精准。
          </p>
        </div>

        {/* 品质标签选择 */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-black mb-4">选择你期望的品质</h3>
          <div className="grid grid-cols-2 gap-3">
            {valueTags.map((tag) => (
              <div
                key={tag.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedValues.includes(tag.id)
                    ? 'bg-pink-100 border-black'
                    : isConfirmed
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleValueSelect(tag.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">{tag.name}</span>
                  <div className={`w-4 h-4 border-2 flex items-center justify-center ${
                    selectedValues.includes(tag.id)
                      ? 'bg-black border-black'
                      : 'border-black'
                  }`}>
                    {selectedValues.includes(tag.id) && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 信息提示 */}
        <div className="mb-8">
          <div className="flex items-start space-x-2">
            <Eye className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              这将显示在您的个人资料上，让其他人了解您期望的伴侣特质。
            </div>
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

          {/* 选择计数 */}
          <span className="text-sm text-gray-600">
            {selectedValues.length}/3 已选择
          </span>

          {/* 下一步按钮 */}
          <button
            onClick={handleConfirm}
            disabled={selectedValues.length === 0 || isConfirmed}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              selectedValues.length > 0 && !isConfirmed
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
              品质偏好已保存，正在跳转...
            </p>
          </div>
        </div>
      )}

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 