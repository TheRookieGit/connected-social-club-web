'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

interface DiagnosticResult {
  status: 'success' | 'error' | null
  message?: string
  data?: any
  error?: string
}

export default function DataSaveDiagnosis() {
  const [diagnosticResults, setDiagnosticResults] = useState<{
    userInfo: DiagnosticResult | null
    token: DiagnosticResult | null
    apiConnectivity: DiagnosticResult | null
    databaseConnection: DiagnosticResult | null
    profileUpdate: DiagnosticResult | null
  }>({
    userInfo: null,
    token: null,
    apiConnectivity: null,
    databaseConnection: null,
    profileUpdate: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testData, setTestData] = useState({
    gender: '',
    age: ''
  })

  const runDiagnostics = async () => {
    setIsLoading(true)
    const results = { ...diagnosticResults }

    try {
      // 1. 检查localStorage中的用户信息
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          results.userInfo = { status: 'success', data: user, message: '用户信息已找到' }
        } catch (error) {
          results.userInfo = { status: 'error', message: '用户信息解析失败', error: String(error) }
        }
      } else {
        results.userInfo = { status: 'error', message: '未找到用户信息' }
      }

      // 2. 检查JWT Token
      if (token) {
        results.token = { status: 'success', data: token.substring(0, 20) + '...', message: 'Token已找到' }
      } else {
        results.token = { status: 'error', message: '未找到JWT Token' }
      }

      // 3. 测试API连接性
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          results.apiConnectivity = { 
            status: 'success', 
            message: 'API连接正常', 
            data: data.user 
          }
        } else {
          const errorData = await response.text()
          results.apiConnectivity = { 
            status: 'error', 
            message: `API响应错误: ${response.status}`, 
            error: errorData 
          }
        }
      } catch (error) {
        results.apiConnectivity = { 
          status: 'error', 
          message: 'API连接失败', 
          error: String(error) 
        }
      }

      // 4. 测试数据库连接
      try {
        const response = await fetch('/api/test-db', {
          method: 'GET'
        })
        
        if (response.ok) {
          results.databaseConnection = { status: 'success', message: '数据库连接正常' }
        } else {
          results.databaseConnection = { status: 'error', message: '数据库连接失败' }
        }
      } catch (error) {
        results.databaseConnection = { 
          status: 'error', 
          message: '数据库连接测试失败', 
          error: String(error) 
        }
      }

    } catch (error) {
      console.error('诊断过程中出错:', error)
    }

    setDiagnosticResults(results)
    setIsLoading(false)
  }

  const testProfileUpdate = async () => {
    if (!testData.gender && !testData.age) {
      alert('请至少填写性别或年龄进行测试')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('未找到认证token，请先登录')
      return
    }

    try {
      const updatePayload: any = {}
      if (testData.gender) {
        updatePayload.gender = testData.gender
      }
      if (testData.age) {
        const today = new Date()
        const birthYear = today.getFullYear() - parseInt(testData.age)
        const birthDate = new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0]
        updatePayload.birth_date = birthDate
      }

      console.log('发送更新请求:', updatePayload)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      })

      const responseData = await response.json()
      console.log('更新响应:', responseData)

      if (response.ok) {
        setDiagnosticResults(prev => ({
          ...prev,
          profileUpdate: { 
            status: 'success', 
            message: '数据更新成功！', 
            data: responseData 
          }
        }))
      } else {
        setDiagnosticResults(prev => ({
          ...prev,
          profileUpdate: { 
            status: 'error', 
            message: '数据更新失败', 
            error: responseData 
          }
        }))
      }
    } catch (error) {
      console.error('更新失败:', error)
      setDiagnosticResults(prev => ({
        ...prev,
        profileUpdate: { 
          status: 'error', 
          message: '更新过程中出错', 
          error: String(error) 
        }
      }))
    }
  }

  const getStatusIcon = (status: 'success' | 'error' | null | undefined) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: 'success' | 'error' | null | undefined) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据保存诊断工具</h1>
          <p className="text-gray-600">检查用户信息保存功能的各个环节</p>
        </div>

        {/* 运行诊断按钮 */}
        <div className="mb-8">
          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '正在诊断...' : '运行诊断'}
          </button>
        </div>

        {/* 诊断结果 */}
        <div className="space-y-6">
          {/* 用户信息检查 */}
          <div className={`p-6 rounded-lg border-2 ${getStatusColor(diagnosticResults.userInfo?.status)}`}>
            <div className="flex items-center mb-4">
              {getStatusIcon(diagnosticResults.userInfo?.status)}
              <h3 className="ml-3 text-lg font-semibold">1. 用户信息检查</h3>
            </div>
            {diagnosticResults.userInfo && (
              <div>
                <p className="text-sm text-gray-700 mb-2">{diagnosticResults.userInfo.message}</p>
                {diagnosticResults.userInfo.data && (
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(diagnosticResults.userInfo.data, null, 2)}
                  </pre>
                )}
                {diagnosticResults.userInfo.error && (
                  <p className="text-red-600 text-sm">{diagnosticResults.userInfo.error}</p>
                )}
              </div>
            )}
          </div>

          {/* JWT Token检查 */}
          <div className={`p-6 rounded-lg border-2 ${getStatusColor(diagnosticResults.token?.status)}`}>
            <div className="flex items-center mb-4">
              {getStatusIcon(diagnosticResults.token?.status)}
              <h3 className="ml-3 text-lg font-semibold">2. JWT Token检查</h3>
            </div>
            {diagnosticResults.token && (
              <div>
                <p className="text-sm text-gray-700 mb-2">{diagnosticResults.token.message}</p>
                {diagnosticResults.token.data && (
                  <p className="text-xs text-gray-500">Token: {diagnosticResults.token.data}</p>
                )}
              </div>
            )}
          </div>

          {/* API连接性检查 */}
          <div className={`p-6 rounded-lg border-2 ${getStatusColor(diagnosticResults.apiConnectivity?.status)}`}>
            <div className="flex items-center mb-4">
              {getStatusIcon(diagnosticResults.apiConnectivity?.status)}
              <h3 className="ml-3 text-lg font-semibold">3. API连接性检查</h3>
            </div>
            {diagnosticResults.apiConnectivity && (
              <div>
                <p className="text-sm text-gray-700 mb-2">{diagnosticResults.apiConnectivity.message}</p>
                {diagnosticResults.apiConnectivity.data && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">当前用户资料:</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResults.apiConnectivity.data, null, 2)}
                    </pre>
                  </div>
                )}
                {diagnosticResults.apiConnectivity.error && (
                  <p className="text-red-600 text-sm">{diagnosticResults.apiConnectivity.error}</p>
                )}
              </div>
            )}
          </div>

          {/* 数据库连接检查 */}
          <div className={`p-6 rounded-lg border-2 ${getStatusColor(diagnosticResults.databaseConnection?.status)}`}>
            <div className="flex items-center mb-4">
              {getStatusIcon(diagnosticResults.databaseConnection?.status)}
              <h3 className="ml-3 text-lg font-semibold">4. 数据库连接检查</h3>
            </div>
            {diagnosticResults.databaseConnection && (
              <div>
                <p className="text-sm text-gray-700">{diagnosticResults.databaseConnection.message}</p>
                {diagnosticResults.databaseConnection.error && (
                  <p className="text-red-600 text-sm">{diagnosticResults.databaseConnection.error}</p>
                )}
              </div>
            )}
          </div>

          {/* 数据更新测试 */}
          <div className={`p-6 rounded-lg border-2 ${getStatusColor(diagnosticResults.profileUpdate?.status)}`}>
            <div className="flex items-center mb-4">
              {getStatusIcon(diagnosticResults.profileUpdate?.status)}
              <h3 className="ml-3 text-lg font-semibold">5. 数据更新测试</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">测试性别</label>
                  <select
                    value={testData.gender}
                    onChange={(e) => setTestData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">选择性别</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="nonbinary">非二元性别</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">测试年龄</label>
                  <input
                    type="number"
                    value={testData.age}
                    onChange={(e) => setTestData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="输入年龄"
                    min="18"
                    max="100"
                  />
                </div>
              </div>
              
              <button
                onClick={testProfileUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                测试数据更新
              </button>

              {diagnosticResults.profileUpdate && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">{diagnosticResults.profileUpdate.message}</p>
                  {diagnosticResults.profileUpdate.data && (
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnosticResults.profileUpdate.data, null, 2)}
                    </pre>
                  )}
                  {diagnosticResults.profileUpdate.error && (
                    <pre className="bg-red-100 p-3 rounded text-xs overflow-auto text-red-700">
                      {JSON.stringify(diagnosticResults.profileUpdate.error, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="text-blue-900 font-medium mb-2">诊断说明</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• 此工具检查用户数据保存的各个环节</li>
                <li>• 如果发现问题，请检查网络连接、登录状态和服务器配置</li>
                <li>• 可以使用第5步测试实际的数据更新功能</li>
                <li>• 所有操作都会在控制台输出详细日志</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 