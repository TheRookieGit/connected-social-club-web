'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Info, Check, Eye } from 'lucide-react'

export default function PurposeSelection() {
  const [selectedPurpose, setSelectedPurpose] = useState('')
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

  const handlePurposeSelect = (purpose: string) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    setSelectedPurpose(purpose)
  }

  const handleConfirm = async () => {
    if (!selectedPurpose) {
      alert('请选择您的使用目的')
      return
    }

    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 更新用户使用目的信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            purpose: selectedPurpose
          })
        })

        if (!response.ok) {
          console.error('更新使用目的信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('处理使用目的选择时出错:', error)
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
        <div className="w-3/4 h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            您来社交俱乐部是为了什么？
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            浪漫和心动，还是一段美好的友谊？选择一个模式来找到您的人。
          </p>
        </div>

        {/* 使用目的选择 */}
        <div className="mb-8">
          <div className="space-y-3">
            {/* 约会选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPurpose === 'dating' 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePurposeSelect('dating')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-lg font-bold text-black mb-1">约会</div>
                  <div className="text-sm text-gray-600">
                    寻找一段关系，随意的，或介于两者之间的
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                  selectedPurpose === 'dating' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedPurpose === 'dating' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 交友选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPurpose === 'friendship' 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePurposeSelect('friendship')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-lg font-bold text-black mb-1">挚友</div>
                  <div className="text-sm text-gray-600">
                    结交新朋友并找到您的社区
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                  selectedPurpose === 'friendship' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedPurpose === 'friendship' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            {/* 商务选项 */}
            <div 
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPurpose === 'business' 
                  ? 'bg-pink-100 border-black' 
                  : isConfirmed
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePurposeSelect('business')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-lg font-bold text-black mb-1">商务</div>
                  <div className="text-sm text-gray-600">
                    专业地建立人脉并发展职业
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${
                  selectedPurpose === 'business' 
                    ? 'bg-black border-black' 
                    : 'border-black'
                }`}>
                  {selectedPurpose === 'business' && (
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
              您只会看到与您处于相同模式的人。
            </div>
          </div>
        </div>

        {/* 确认按钮 */}
        {!isConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={!selectedPurpose}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              selectedPurpose
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
              使用目的已保存，正在跳转...
            </p>
          </div>
        )}
      </div>

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 