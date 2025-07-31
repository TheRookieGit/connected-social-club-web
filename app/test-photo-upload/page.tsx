'use client'

import { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function TestPhotoUpload() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }])
  }

  const runEnvironmentTest = async () => {
    setIsLoading(true)
    setTestResults([])

    try {
      // 测试1: 检查环境变量
      addTestResult('环境变量检查', 'info', '开始检查环境变量...')
      
      const envTestResponse = await fetch('/api/test-db?test=env')
      const envTestData = await envTestResponse.text()
      
      try {
        const envData = JSON.parse(envTestData)
        addTestResult('环境变量', 'success', '环境变量检查完成', envData)
      } catch (error) {
        addTestResult('环境变量', 'error', '环境变量检查失败', envTestData)
      }

      // 测试2: 检查API连接
      addTestResult('API连接测试', 'info', '开始测试API连接...')
      
      const apiTestResponse = await fetch('/api/user/upload-photos-admin?test=true')
      const apiTestData = await apiTestResponse.text()
      
      try {
        const apiData = JSON.parse(apiTestData)
        addTestResult('API连接', 'success', 'API连接正常', apiData)
      } catch (error) {
        addTestResult('API连接', 'error', 'API连接失败', apiTestData)
      }

      // 测试3: 检查Supabase连接
      addTestResult('Supabase连接测试', 'info', '开始测试Supabase连接...')
      
      const supabaseTestResponse = await fetch('/api/test-db?test=supabase')
      const supabaseTestData = await supabaseTestResponse.text()
      
      try {
        const supabaseData = JSON.parse(supabaseTestData)
        addTestResult('Supabase连接', 'success', 'Supabase连接正常', supabaseData)
      } catch (error) {
        addTestResult('Supabase连接', 'error', 'Supabase连接失败', supabaseTestData)
      }

      // 测试4: 检查存储桶
      addTestResult('存储桶测试', 'info', '开始测试存储桶...')
      
      const storageTestResponse = await fetch('/api/test-storage')
      const storageTestData = await storageTestResponse.text()
      
      try {
        const storageData = JSON.parse(storageTestData)
        addTestResult('存储桶', 'success', '存储桶检查完成', storageData)
      } catch (error) {
        addTestResult('存储桶', 'error', '存储桶检查失败', storageTestData)
      }

    } catch (error) {
      addTestResult('测试执行', 'error', '测试执行失败', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runPhotoUploadTest = async () => {
    setIsLoading(true)
    setTestResults([])

    try {
      // 创建一个测试图片
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(0, 0, 100, 100)
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'
        ctx.fillText('TEST', 25, 55)
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          addTestResult('照片上传测试', 'error', '无法创建测试图片')
          setIsLoading(false)
          return
        }

        const testFile = new File([blob], 'test-photo.jpg', { type: 'image/jpeg' })
        const formData = new FormData()
        formData.append('photos', testFile)

        addTestResult('照片上传测试', 'info', '开始上传测试图片...')

        try {
          const token = localStorage.getItem('token')
          if (!token) {
            addTestResult('照片上传测试', 'error', '未找到登录令牌')
            setIsLoading(false)
            return
          }

          const response = await fetch('/api/user/upload-photos-admin', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })

          const responseText = await response.text()
          console.log('照片上传响应:', responseText)

          try {
            const result = JSON.parse(responseText)
            if (response.ok) {
              addTestResult('照片上传测试', 'success', '照片上传成功', result)
            } else {
              addTestResult('照片上传测试', 'error', '照片上传失败', result)
            }
          } catch (parseError) {
            addTestResult('照片上传测试', 'error', '响应解析失败', {
              status: response.status,
              responseText: responseText.substring(0, 200)
            })
          }
        } catch (error) {
          addTestResult('照片上传测试', 'error', '上传请求失败', error)
        } finally {
          setIsLoading(false)
        }
      }, 'image/jpeg', 0.8)

    } catch (error) {
      addTestResult('照片上传测试', 'error', '测试准备失败', error)
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            照片上传诊断工具
          </h1>
          <p className="text-gray-600 mb-6">
            这个工具可以帮助诊断Vercel部署环境中的照片上传问题
          </p>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={runEnvironmentTest}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>运行环境测试</span>
            </button>

            <button
              onClick={runPhotoUploadTest}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>测试照片上传</span>
            </button>

            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              清除结果
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-600 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>正在运行测试...</span>
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">测试结果</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' :
                    result.status === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : result.status === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{result.test}</h3>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                            查看详细信息
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 