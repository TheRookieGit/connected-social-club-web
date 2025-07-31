'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TestSimpleRegistration() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const checkRegistrationStatus = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTestResult({ 
          success: false, 
          message: '未找到认证token，请先登录',
          shouldShow: '需要登录'
        })
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setTestResult({ 
          success: false, 
          message: '获取用户信息失败'
        })
        return
      }

      const data = await response.json()
      if (!data.success || !data.user) {
        setTestResult({ 
          success: false, 
          message: '用户数据无效'
        })
        return
      }

      const user = data.user
      
      // 检查是否完成完整注册流程
      const hasBasicInfo = user.gender && user.birth_date
      const hasInterests = user.interests && user.interests.length > 0
      const hasValues = (user.values_preferences && user.values_preferences.length > 0)
      const hasLifestyle = user.smoking_status && user.drinking_status
      const hasFamilyPlans = user.family_plans !== null
      
      const isCompleteRegistration = hasBasicInfo && hasInterests && hasValues && hasLifestyle && hasFamilyPlans
      
      if (isCompleteRegistration) {
        setTestResult({
          success: true,
          message: '✅ 用户已完成完整注册',
          shouldShow: '应该直接进入 Dashboard',
          details: user
        })
      } else {
        setTestResult({
          success: false,
          message: '⏳ 用户未完成完整注册',
          shouldShow: '应该进入注册流程',
          details: {
            hasBasicInfo,
            hasInterests,
            hasValues,
            hasLifestyle,
            hasFamilyPlans,
            user: {
              gender: user.gender,
              birth_date: user.birth_date,
              interests: user.interests,
              values_preferences: user.values_preferences,
              smoking_status: user.smoking_status,
              drinking_status: user.drinking_status,
              family_plans: user.family_plans
            }
          }
        })
      }

    } catch (error) {
      console.error('检查失败:', error)
      setTestResult({
        success: false,
        message: '检查过程中出错',
        error: String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  const simulateLogin = () => {
    if (testResult?.success) {
      router.push('/dashboard')
    } else {
      router.push('/gender-selection')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">简化注册流程测试</h1>
          
          <div className="space-y-6">
            {/* 测试按钮 */}
            <div className="flex space-x-4">
              <button
                onClick={checkRegistrationStatus}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '检查中...' : '🔍 检查注册状态'}
              </button>

              {testResult && (
                <button
                  onClick={simulateLogin}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
                >
                  🚀 模拟登录跳转
                </button>
              )}
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className={`rounded-lg p-6 border-2 ${
                testResult.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center mb-4">
                  {testResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="w-6 h-6 text-yellow-600 mr-3" />
                  )}
                  <h3 className="text-lg font-semibold">测试结果</h3>
                </div>
                
                <p className={`mb-4 ${testResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
                  {testResult.message}
                </p>

                <p className="text-sm font-medium mb-4">
                  登录后行为：{testResult.shouldShow}
                </p>

                {testResult.details && (
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium mb-2">详细信息</summary>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* 修复说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-900 font-medium mb-2">修复方案</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>✅ 保持完整的注册流程不变</li>
                    <li>✅ 登录时检查是否已完成完整注册</li>
                    <li>✅ 已注册用户直接进入dashboard</li>
                    <li>✅ 未注册用户进入注册流程</li>
                    <li>✅ 移除了页面级的复杂预检查逻辑</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 注册流程说明 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium mb-3">完整注册流程：</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. 性别选择 → 2. 年龄选择 → 3. 使用目的 → 4. 约会偏好</p>
                <p>5. 兴趣爱好 → 6. 我希望你是... → 7. 生活方式 → 8. 家庭规划 → 9. 照片上传</p>
                <p className="text-green-600 font-medium mt-2">完成后 → Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 