'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RegistrationStatus {
  hasBasicInfo: boolean
  hasInterests: boolean
  hasValues: boolean
  hasLifestyle: boolean
  hasFamilyPlans: boolean
  isComplete: boolean
  nextStep: string
  user: any
}

export default function TestRegistrationFlow() {
  const [status, setStatus] = useState<RegistrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const checkRegistrationStatus = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未找到认证token，请先登录')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setError('获取用户信息失败')
        return
      }

      const data = await response.json()
      if (!data.success || !data.user) {
        setError('用户数据无效')
        return
      }

      const user = data.user
      
      // 检查各个注册步骤
      const hasBasicInfo = user.gender && user.birth_date
      const hasInterests = user.interests && user.interests.length > 0
      const hasValues = (user.values_preferences && user.values_preferences.length > 0)
      const hasLifestyle = user.smoking_status && user.drinking_status
      const hasFamilyPlans = user.family_plans !== null
      
      const isComplete = hasBasicInfo && hasInterests && hasValues && hasLifestyle && hasFamilyPlans
      
      // 确定下一步应该去哪里
      let nextStep = ''
      if (isComplete) {
        nextStep = '/dashboard'
      } else if (!user.gender) {
        nextStep = '/gender-selection'
      } else if (!user.birth_date) {
        nextStep = '/age-selection'
      } else if (!hasInterests) {
        nextStep = '/interests'
      } else if (!hasValues) {
        nextStep = '/values'
      } else if (!hasLifestyle) {
        nextStep = '/lifestyle'
      } else if (!hasFamilyPlans) {
        nextStep = '/family-plans'
      }

      setStatus({
        hasBasicInfo,
        hasInterests,
        hasValues,
        hasLifestyle,
        hasFamilyPlans,
        isComplete,
        nextStep,
        user
      })

    } catch (error) {
      console.error('检查注册状态失败:', error)
      setError('检查过程中出错')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateLogin = () => {
    // 模拟登录逻辑
    const token = localStorage.getItem('token')
    if (!token) {
      setError('请先登录')
      return
    }

    if (status?.isComplete) {
      console.log('用户已完成注册，跳转到dashboard')
      router.push('/dashboard')
    } else {
      console.log('用户未完成注册，跳转到:', status?.nextStep)
      router.push(status?.nextStep || '/gender-selection')
    }
  }

  const getStepIcon = (completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else {
      return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">注册流程测试</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 检查按钮 */}
            <div className="flex space-x-4">
              <button
                onClick={checkRegistrationStatus}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    检查中...
                  </>
                ) : (
                  '🔍 检查注册状态'
                )}
              </button>

              {status && (
                <button
                  onClick={simulateLogin}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
                >
                  🚀 模拟登录跳转
                </button>
              )}
            </div>

            {/* 注册状态显示 */}
            {status && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">注册完成状态</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    {getStepIcon(status.hasBasicInfo)}
                    <span>基本信息 (性别 + 年龄)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStepIcon(status.hasInterests)}
                    <span>兴趣爱好</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStepIcon(status.hasValues)}
                    <span>价值观</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStepIcon(status.hasLifestyle)}
                    <span>生活方式</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStepIcon(status.hasFamilyPlans)}
                    <span>家庭规划</span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  status.isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    {status.isComplete ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    )}
                    <h3 className="font-semibold">
                      {status.isComplete ? '✅ 注册已完成' : '⏳ 注册未完成'}
                    </h3>
                  </div>
                  <p className="text-sm">
                    {status.isComplete 
                      ? '用户可以直接进入dashboard' 
                      : `下一步应该跳转到：${status.nextStep}`
                    }
                  </p>
                </div>

                {/* 用户数据详情 */}
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium mb-2">用户数据详情</summary>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify({
                      gender: status.user.gender,
                      birth_date: status.user.birth_date,
                      interests: status.user.interests,
                      values_preferences: status.user.values_preferences,
                      smoking_status: status.user.smoking_status,
                      drinking_status: status.user.drinking_status,
                      family_plans: status.user.family_plans
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* 说明信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-900 font-medium mb-2">修复说明</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✅ 恢复了完整的注册流程检查逻辑</li>
                <li>✅ 用户必须完成所有主要步骤才能直接进入dashboard</li>
                <li>✅ 已完成注册的用户登录时会直接跳转到dashboard</li>
                <li>✅ 未完成注册的用户会继续从上次中断的地方开始</li>
                <li>✅ 避免了重复填写已完成的步骤</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 