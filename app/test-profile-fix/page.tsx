'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface TestResult {
  success: boolean
  message: string
  details?: any
}

export default function TestProfileFix() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testProfileUpdate = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTestResult({ 
          success: false, 
          message: '未找到认证token，请先登录',
          details: 'Token not found in localStorage'
        })
        return
      }

      // 测试简单的性别更新
      const testData = {
        gender: 'male',
        birth_date: '1990-01-01'
      }

      console.log('Testing profile update with:', testData)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      })

      const responseData = await response.json()
      console.log('Update response:', responseData)

      if (response.ok) {
        setTestResult({
          success: true,
          message: '✅ 数据更新成功！问题已修复！',
          details: responseData
        })
      } else {
        setTestResult({
          success: false,
          message: '❌ 数据更新失败',
          details: responseData
        })
      }

    } catch (error) {
      console.error('Test failed:', error)
      setTestResult({
        success: false,
        message: '测试过程中出错',
        details: String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('Current user profile:', data)
      
      if (response.ok) {
        alert('用户资料已输出到控制台，请按F12查看')
      } else {
        alert('获取用户资料失败')
      }
    } catch (error) {
      console.error('Get profile failed:', error)
      alert('获取用户资料出错')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">用户资料修复测试</h1>
          
          <div className="space-y-6">
            {/* 当前状态 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">🔧 修复内容</h2>
              <ul className="text-blue-800 space-y-2">
                <li>✅ 修复了API中对不存在字段的更新尝试</li>
                <li>✅ 移除了 interests 和 preferences 字段的直接更新</li>
                <li>✅ 保持了对关联表的正确更新逻辑</li>
                <li>✅ 创建了数据库字段修复脚本</li>
              </ul>
            </div>

            {/* 测试按钮 */}
            <div className="flex space-x-4">
              <button
                onClick={testProfileUpdate}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? '测试中...' : '🧪 测试资料更新'}
              </button>

              <button
                onClick={getUserProfile}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                📋 查看当前资料
              </button>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className={`rounded-lg p-6 border-2 ${
                testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-4">
                  {testResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mr-3" />
                  )}
                  <h3 className="text-lg font-semibold">测试结果</h3>
                </div>
                
                <p className={`mb-4 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
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

            {/* 下一步指示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-900 font-medium mb-2">重要提醒</h3>
                  <div className="text-yellow-800 space-y-2">
                    <p><strong>1. 运行数据库修复脚本：</strong></p>
                    <p className="ml-4">请在 Supabase SQL Editor 中运行 <code>fix_database_schema.sql</code> 文件</p>
                    
                    <p><strong>2. 测试更新功能：</strong></p>
                    <p className="ml-4">点击上面的&quot;测试资料更新&quot;按钮验证修复效果</p>
                    
                    <p><strong>3. 检查注册流程：</strong></p>
                    <p className="ml-4">如果测试成功，重新尝试性别选择和年龄选择页面</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 