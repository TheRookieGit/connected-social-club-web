'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { 
  requestLocationPermission, 
  saveLocationPermissionSettings, 
  getCachedLocation 
} from '@/lib/locationPermission'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLocationPermission, setShowLocationPermission] = useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [rememberLocationPermission, setRememberLocationPermission] = useState(false)
  const router = useRouter()

  // 处理LinkedIn登录返回的token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const user = urlParams.get('user')
    const error = urlParams.get('error')

    if (error) {
      setError('LinkedIn登录失败，请重试')
      // 清理URL参数
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (token && user) {
      console.log('LoginForm: 检测到LinkedIn登录成功，开始处理...')
      console.log('LoginForm: Token:', token.substring(0, 20) + '...')
      
      try {
        // 解析用户数据
        const userData = JSON.parse(decodeURIComponent(user))
        console.log('LoginForm: 解析的用户数据:', userData)
        
        // 保存token和用户信息 - 确保用户数据格式正确
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        console.log('LoginForm: 已保存token和用户信息到localStorage')
        console.log('LoginForm: 用户ID:', userData.id, '类型:', typeof userData.id)
        
        // 清理URL参数
        window.history.replaceState({}, document.title, window.location.pathname)
        
        console.log('LoginForm: 准备显示位置权限请求...')
        
        // 显示位置权限请求
        setShowLocationPermission(true)
      } catch (error) {
        console.error('LoginForm: 处理LinkedIn登录数据时出错:', error)
        setError('处理登录信息时出错，请重试')
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // 显示位置权限请求
        setShowLocationPermission(true)
      } else {
        setError(data.error || '登录失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationPermission = async () => {
    try {
      // 使用权限管理工具请求位置权限
      const success = await requestLocationPermission()
      
      if (success) {
        // 如果用户选择记住权限，保存设置
        if (rememberLocationPermission) {
          saveLocationPermissionSettings({ remembered: true })
        }

        // 更新用户位置到服务器
        const token = localStorage.getItem('token')
        const locationData = getCachedLocation()
        
        if (token && locationData) {
          try {
            await fetch('/api/user/location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(locationData)
            })
          } catch (error) {
            console.error('更新位置到服务器失败:', error)
          }
        }

        setLocationPermissionGranted(true)
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // 位置获取失败，直接跳转
        router.push('/dashboard')
      }
      
    } catch (error: any) {
      console.error('获取位置失败:', error)
      // 即使位置获取失败，也跳转到dashboard
      router.push('/dashboard')
    }
  }

  const handleSkipLocation = () => {
    router.push('/dashboard')
  }

  const handleLinkedInLogin = () => {
    console.log('🔗 LinkedIn登录按钮被点击')
    
    // 显示加载提示
    const notification = document.createElement('div')
    notification.className = 'fixed top-20 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    notification.innerHTML = '🔗 正在跳转到LinkedIn...'
    document.body.appendChild(notification)
    
    // 延迟一下让用户看到提示，然后跳转
    setTimeout(() => {
      console.log('🚀 开始跳转到LinkedIn OAuth页面')
      window.location.href = '/api/auth/linkedin'
    }, 500)
    
    // 3秒后移除提示（以防跳转失败）
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* LinkedIn登录按钮 */}
      <button
        type="button"
        onClick={handleLinkedInLogin}
        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        使用LinkedIn登录
      </button>

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">或使用邮箱登录</span>
        </div>
      </div>

      {/* 原有的邮箱登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="请输入密码"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              记住我
            </label>
          </div>
          <a href="#" className="text-sm text-red-500 hover:text-red-600">
            忘记密码？
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '登录中...' : '登录'}
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600">还没有账号？</span>
          <button
            type="button"
            onClick={() => window.location.href = '/?register=true'}
            className="text-sm text-red-500 hover:text-red-600 ml-1 bg-transparent border-none cursor-pointer"
          >
            立即注册
          </button>
                </div>
      </form>

      {/* 位置权限请求模态框 */}
      {showLocationPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {!locationPermissionGranted ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">位置权限请求</h3>
                  <p className="text-sm text-gray-600">
                    为了提供更好的服务，我们需要获取您的位置信息。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">位置信息将用于：</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 显示附近的其他用户</li>
                      <li>• 计算用户间的距离</li>
                      <li>• 提供本地化的推荐</li>
                      <li>• 改善匹配算法</li>
                    </ul>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="remember-location"
                      type="checkbox"
                      checked={rememberLocationPermission}
                      onChange={(e) => setRememberLocationPermission(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-location" className="ml-2 block text-sm text-gray-700">
                      记住我的选择，以后不再询问
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSkipLocation}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    跳过
                  </button>
                  <button
                    onClick={handleLocationPermission}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    允许访问位置
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">位置权限已获取</h3>
                <p className="text-sm text-gray-600">
                  正在跳转到仪表板...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 