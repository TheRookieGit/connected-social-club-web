'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Info, Check } from 'lucide-react'

export default function AgeSelection() {
  const [age, setAge] = useState('')
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
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

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isConfirmed) return // 如果已确认，不允许更改
    const value = e.target.value
    // 只允许输入数字，且范围在18-100之间
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 18 && parseInt(value) <= 100)) {
      setAge(value)
    }
  }

  const handleConfirm = async () => {
    if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
      alert('请输入有效的年龄（18-100岁）')
      return
    }

    setShowConfirmation(true)
  }

  const handleFinalConfirm = async () => {
    setIsConfirmed(true)
    setIsLoading(true)
    
    try {
      // 计算出生日期（假设今天是用户的生日）
      const today = new Date()
      const birthYear = today.getFullYear() - parseInt(age)
      const birthDate = new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0]

      // 更新用户年龄信息到服务器
      const token = localStorage.getItem('token')
      if (token) {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            birth_date: birthDate
          })
        })

        if (!response.ok) {
          console.error('更新年龄信息失败')
        }
      }

      // 延迟跳转，让用户看到确认状态
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('处理年龄选择时出错:', error)
      // 即使出错也继续跳转
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setShowConfirmation(false)
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
        <div className="w-1/2 h-full bg-black"></div>
      </div>

      {/* 主要内容 */}
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* 标题和介绍 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">
            很高兴认识您，{userName}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            为了提供更好的服务，请告诉我们您的年龄。
          </p>
        </div>

        {/* 年龄输入 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-4 text-center">
            您今年多大了？
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={age}
                onChange={handleAgeChange}
                disabled={isConfirmed}
                className={`w-full p-4 text-center text-2xl font-bold border-2 rounded-lg transition-all ${
                  isConfirmed
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'border-gray-300 focus:border-black focus:outline-none'
                }`}
                placeholder="请输入年龄"
                maxLength={3}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                岁
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              请输入18-100岁之间的年龄
            </div>
          </div>
        </div>

        {/* 信息提示 */}
        <div className="mb-8">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <button className="text-black underline hover:no-underline">
                关于年龄验证的说明
              </button>
            </div>
          </div>
        </div>

        {/* 确认按钮 */}
        {!showConfirmation && !isConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={!age || parseInt(age) < 18 || parseInt(age) > 100}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              age && parseInt(age) >= 18 && parseInt(age) <= 100
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            确认年龄
          </button>
        )}

        {/* 确认对话框 */}
        {showConfirmation && !isConfirmed && (
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">请确认您的年龄</h3>
              <p className="text-sm text-gray-600">
                您的年龄是 <span className="font-bold text-black">{age}岁</span>
              </p>
              <p className="text-xs text-red-600 mt-2">
                请注意：年龄信息确认后将无法修改，请仔细核对
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                返回修改
              </button>
              <button
                onClick={handleFinalConfirm}
                className="flex-1 py-2 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                确认无误
              </button>
            </div>
          </div>
        )}

        {/* 确认状态 */}
        {isConfirmed && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">
              年龄信息已保存，正在跳转...
            </p>
          </div>
        )}
      </div>

      {/* 底部指示器 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-black"></div>
    </div>
  )
} 