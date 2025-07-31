'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugRegistration() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查localStorage中的用户信息
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserInfo({ ...user, token: token ? '存在' : '不存在' })
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
  }, [])

  const checkProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('没有找到token')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      } else {
        setProfileData({ error: '获取用户资料失败', status: response.status })
      }
    } catch (error) {
      setProfileData({ error: '请求失败', details: error })
    } finally {
      setLoading(false)
    }
  }

  const simulateNewRegistration = () => {
    // 模拟新注册用户
    const mockUser = {
      id: 'new-user-' + Date.now(),
      email: 'newuser@example.com',
      name: '新用户',
      phone: null
    }
    
    const mockToken = 'new-user-token-' + Date.now()
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    setUserInfo({ ...mockUser, token: '存在' })
    setProfileData(null)
  }

  const goToGenderSelection = () => {
    router.push('/gender-selection')
  }

  const clearAll = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUserInfo(null)
    setProfileData(null)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">注册流程调试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 用户信息 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">LocalStorage 用户信息</h2>
          {userInfo ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {userInfo.id}</p>
              <p><strong>姓名:</strong> {userInfo.name}</p>
              <p><strong>邮箱:</strong> {userInfo.email}</p>
              <p><strong>手机:</strong> {userInfo.phone || '无'}</p>
              <p><strong>Token:</strong> {userInfo.token}</p>
            </div>
          ) : (
            <p className="text-gray-500">没有用户信息</p>
          )}
        </div>

        {/* 用户资料 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">数据库用户资料</h2>
          {profileData ? (
            <div className="space-y-2">
              {profileData.success ? (
                <>
                  <p><strong>性别:</strong> {profileData.user.gender || '未设置'}</p>
                  <p><strong>生日:</strong> {profileData.user.birth_date || '未设置'}</p>
                  <p><strong>兴趣:</strong> {profileData.user.interests?.length || 0} 个</p>
                  <p><strong>期望品质:</strong> {profileData.user.values_preferences?.length || 0} 个</p>
                </>
              ) : (
                <p className="text-red-500">{profileData.error}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">未获取资料</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={checkProfile}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '检查中...' : '检查用户资料'}
          </button>
          
          <button
            onClick={simulateNewRegistration}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            模拟新注册用户
          </button>
          
          <button
            onClick={goToGenderSelection}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
          >
            跳转到性别选择
          </button>
          
          <button
            onClick={clearAll}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            清除所有数据
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">调试说明</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>新注册用户应该没有性别和生日信息</li>
            <li>如果用户资料显示已设置性别，会跳转到下一步</li>
            <li>如果用户资料显示未设置性别，应该继续注册流程</li>
            <li>点击&quot;模拟新注册用户&quot;可以测试新用户的流程</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 