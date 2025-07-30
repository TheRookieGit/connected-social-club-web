'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Search, Check, Eye } from 'lucide-react'

export default function Interests() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()

  // 防止后退功能
  useEffect(() => {
    // 在页面加载时立即添加历史记录，防止直接后退
    window.history.pushState(null, '', '/interests')

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果用户已经选择了兴趣，就阻止离开页面
      if (selectedInterests.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // 如果用户已经选择了兴趣，阻止后退
      if (selectedInterests.length > 0) {
        // 阻止默认的后退行为
        e.preventDefault()
        // 立即重新添加当前页面到历史记录
        window.history.pushState(null, '', '/interests')
        // 显示提示信息
        alert('请完成当前页面的选择后再继续')
        // 强制阻止导航
        return false
      }
    }

    // 监听浏览器后退按钮
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && selectedInterests.length > 0) {
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
  }, [selectedInterests])

  // 兴趣标签数据
  const interestTags = [
    { id: 'baking', name: '烘焙', emoji: '🍰' },
    { id: 'lgbtq_rights', name: 'LGBTQ+', emoji: '🏳️‍🌈' },
    { id: 'hiking', name: '徒步', emoji: '⛰️' },
    { id: 'gardening', name: '园艺', emoji: '🌱' },
    { id: 'rnb', name: '音乐', emoji: '🎵' },
    { id: 'art', name: '艺术', emoji: '🎨' },
    { id: 'writing', name: '写作', emoji: '📝' },
    { id: 'country', name: '绘画', emoji: '🖼️' },
    { id: 'skiing', name: '阅读', emoji: '📚' },
    { id: 'museums', name: '博物馆', emoji: '🏛️' },
    { id: 'vegetarian', name: '素食', emoji: '🥦' },
    { id: 'horror', name: '电影', emoji: '📺' },
    { id: 'dancing', name: '跳舞', emoji: '💃' },
    { id: 'yoga', name: '瑜伽', emoji: '🧘' },
    { id: 'dogs', name: '狗', emoji: '🐶' },
    { id: 'crafts', name: '手工艺', emoji: '🧷' },
    { id: 'festivals', name: '节日', emoji: '🎉' },
    { id: 'tennis', name: '运动', emoji: '🎾' },
    { id: 'cats', name: '猫', emoji: '🐱' },
    { id: 'concerts', name: '音乐会', emoji: '🎟️' },
    { id: 'foodie', name: '美食', emoji: '🍜' },
    { id: 'exploring_cities', name: '旅游', emoji: '🏙️' },
    { id: 'camping', name: '露营', emoji: '⛺' },
    { id: 'wine', name: '葡萄酒', emoji: '🍷' },
    { id: 'feminism', name: '女权主义', emoji: '💛' },
    { id: 'coffee', name: '咖啡', emoji: '☕' },
    { id: 'gaming', name: '游戏', emoji: '🎮' }
  ]

  const handleInterestSelect = (interestId: string) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId)
      } else {
        // 限制最多选择5个选项
        if (prev.length >= 5) {
          return prev
        }
        return [...prev, interestId]
      }
    })
  }

  const handleConfirm = async () => {
    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户兴趣爱好信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            interests: selectedInterests
          })
        })

        if (!response.ok) {
          console.error('更新兴趣爱好信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/values')
      }, 1500)
    } catch (error) {
      console.error('处理兴趣爱好选择时出错:', error)
      // 即使出错也继续跳转
      setTimeout(() => {
        router.push('/values')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/values')
  }

  // 过滤兴趣标签
  const filteredInterests = interestTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="w-[60%] h-full bg-black"></div>
      </div>

             {/* 主要内容 */}
       <div className="px-6 py-8 max-w-lg mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            选择5件您真正喜欢的事情
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            是美食家还是攀岩爱好者？将兴趣添加到您的个人资料中，帮助您匹配到与您有共同爱好的人。
          </p>
        </div>

        {/* 搜索栏 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="您喜欢什么？"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* 兴趣标签选择 */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-black mb-4">您可能会喜欢...</h3>
                     <div className="grid grid-cols-3 gap-3">
            {filteredInterests.map((tag) => (
              <div
                key={tag.id}
                                 className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                   selectedInterests.includes(tag.id)
                     ? 'bg-pink-100 border-black'
                     : isConfirmed
                     ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                     : 'bg-white border-gray-300 hover:border-gray-400'
                 }`}
                onClick={() => handleInterestSelect(tag.id)}
              >
                                 <div className="flex items-center justify-between h-full">
                   <div className="flex items-center space-x-2 flex-1">
                     <span className="text-lg flex-shrink-0">{tag.emoji}</span>
                     <span className="text-sm font-medium text-black leading-tight">{tag.name}</span>
                   </div>
                                     <div className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${
                     selectedInterests.includes(tag.id)
                       ? 'bg-black border-black'
                       : 'border-black'
                   }`}>
                     {selectedInterests.includes(tag.id) && (
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
              这将显示在您的个人资料上，以帮助每个人找到他们正在寻找的东西。
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
            {selectedInterests.length}/5 已选择
          </span>

          {/* 下一步按钮 */}
          <button
            onClick={handleConfirm}
            disabled={selectedInterests.length === 0 || isConfirmed}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              selectedInterests.length > 0 && !isConfirmed
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
              兴趣爱好已保存，正在跳转...
            </p>
          </div>
        </div>
      )}

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 