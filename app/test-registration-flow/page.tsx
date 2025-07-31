'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestRegistrationFlow() {
  const [status, setStatus] = useState('')
  const router = useRouter()

  const testRegistration = async () => {
    setStatus('测试注册中...')
    
    try {
      // 模拟注册成功
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '测试用户',
        phone: null
      }
      
      const mockToken = 'mock-jwt-token'
      
      // 保存到localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      setStatus('注册成功，准备跳转到性别选择页面...')
      
      // 等待一秒后跳转
      setTimeout(() => {
        router.push('/gender-selection')
      }, 1000)
      
    } catch (error) {
      setStatus('测试失败: ' + error)
    }
  }

  const testDirectNavigation = () => {
    setStatus('直接跳转到性别选择页面...')
    router.push('/gender-selection')
  }

  const clearStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setStatus('已清除localStorage')
  }

  const checkStorage = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    setStatus(`Token: ${token ? '存在' : '不存在'}, User: ${user ? '存在' : '不存在'}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">注册流程测试</h1>
      
      <div className="space-y-4">
        <button
          onClick={testRegistration}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          测试完整注册流程
        </button>
        
        <button
          onClick={testDirectNavigation}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          直接跳转到性别选择
        </button>
        
        <button
          onClick={checkStorage}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
        >
          检查localStorage
        </button>
        
        <button
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          清除localStorage
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">状态</h3>
        <p className="text-sm">{status || '等待操作...'}</p>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">说明</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>这个页面用于测试注册成功后的跳转逻辑</li>
          <li>点击"测试完整注册流程"会模拟注册成功并跳转</li>
          <li>点击"直接跳转到性别选择"会直接导航到性别选择页面</li>
          <li>如果跳转失败，请检查浏览器控制台是否有错误</li>
        </ul>
      </div>
    </div>
  )
} 