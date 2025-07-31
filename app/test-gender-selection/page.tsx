'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestGenderSelection() {
  const [status, setStatus] = useState('')
  const router = useRouter()

  const simulateNewUser = () => {
    // 模拟新注册用户（没有性别信息）
    const mockUser = {
      id: 'new-user-' + Date.now(),
      email: 'newuser@example.com',
      name: '新用户',
      phone: null
    }
    
    const mockToken = 'new-user-token-' + Date.now()
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    setStatus('已设置新用户信息，准备跳转到性别选择页面...')
    
    setTimeout(() => {
      router.push('/gender-selection')
    }, 1000)
  }

  const simulateUserWithGender = () => {
    // 模拟已设置性别的用户
    const mockUser = {
      id: 'user-with-gender-' + Date.now(),
      email: 'userwithgender@example.com',
      name: '已设置性别用户',
      phone: null
    }
    
    const mockToken = 'user-with-gender-token-' + Date.now()
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    setStatus('已设置有性别信息的用户，准备跳转到性别选择页面...')
    
    setTimeout(() => {
      router.push('/gender-selection')
    }, 1000)
  }

  const simulateCompleteUser = () => {
    // 模拟已完成注册的用户
    const mockUser = {
      id: 'complete-user-' + Date.now(),
      email: 'completeuser@example.com',
      name: '已完成用户',
      phone: null
    }
    
    const mockToken = 'complete-user-token-' + Date.now()
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    setStatus('已设置已完成注册的用户，准备跳转到性别选择页面...')
    
    setTimeout(() => {
      router.push('/gender-selection')
    }, 1000)
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
      <h1 className="text-2xl font-bold mb-6">性别选择页面测试</h1>
      
      <div className="space-y-4">
        <button
          onClick={simulateNewUser}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
        >
          模拟新注册用户（无性别信息）
        </button>
        
        <button
          onClick={simulateUserWithGender}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
        >
          模拟已设置性别用户
        </button>
        
        <button
          onClick={simulateCompleteUser}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 w-full"
        >
          模拟已完成注册用户
        </button>
        
        <button
          onClick={checkStorage}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 w-full"
        >
          检查localStorage
        </button>
        
        <button
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
        >
          清除localStorage
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">状态</h3>
        <p className="text-sm">{status || '等待操作...'}</p>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">测试说明</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>新注册用户</strong>：应该停留在性别选择页面，让用户选择性别</li>
          <li><strong>已设置性别用户</strong>：应该跳转到年龄选择页面</li>
          <li><strong>已完成用户</strong>：应该跳转到dashboard</li>
          <li>选择性别后应该跳转到年龄选择页面，而不是dashboard</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">预期行为</h3>
        <p className="text-sm">
          修复后，新注册用户选择性别并确认后，应该跳转到 <code>/age-selection</code> 页面，
          而不是回到 <code>/dashboard</code>。
        </p>
      </div>
    </div>
  )
} 