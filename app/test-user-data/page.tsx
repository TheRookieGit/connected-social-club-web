'use client'

import { useState, useEffect } from 'react'

export default function TestUserData() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('未找到登录token')
          setLoading(false)
          return
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('获取到的用户数据:', data)
        setUserData(data.user)
      } catch (err) {
        console.error('获取用户数据失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return <div className="p-8">加载中...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">错误: {error}</div>
  }

  if (!userData) {
    return <div className="p-8">未找到用户数据</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">用户数据测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">基本信息</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {userData.id}</p>
            <p><strong>姓名:</strong> {userData.name}</p>
            <p><strong>邮箱:</strong> {userData.email}</p>
            <p><strong>性别:</strong> {userData.gender}</p>
            <p><strong>生日:</strong> {userData.birth_date}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">约会和家庭信息</h2>
          <div className="space-y-2">
            <p><strong>约会目的 (dating_style):</strong> 
              <span className={userData.dating_style ? 'text-green-600' : 'text-red-500'}>
                {userData.dating_style || '未设置'}
              </span>
            </p>
            <p><strong>家庭计划 (family_plans):</strong> 
              <span className={userData.family_plans ? 'text-green-600' : 'text-red-500'}>
                {userData.family_plans || '未设置'}
              </span>
            </p>
            <p><strong>是否有孩子 (has_kids):</strong> 
              <span className={userData.has_kids !== null ? 'text-green-600' : 'text-red-500'}>
                {userData.has_kids !== null ? String(userData.has_kids) : '未设置'}
              </span>
            </p>
            <p><strong>关系状态 (relationship_status):</strong> 
              <span className={userData.relationship_status ? 'text-green-600' : 'text-red-500'}>
                {userData.relationship_status || '未设置'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">其他信息</h2>
          <div className="space-y-2">
            <p><strong>个人简介:</strong> {userData.bio || '未设置'}</p>
            <p><strong>位置:</strong> {userData.location || '未设置'}</p>
            <p><strong>职业:</strong> {userData.occupation || '未设置'}</p>
            <p><strong>吸烟状态:</strong> {userData.smoking_status || '未设置'}</p>
            <p><strong>饮酒状态:</strong> {userData.drinking_status || '未设置'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">时间戳</h2>
          <div className="space-y-2">
            <p><strong>创建时间:</strong> {userData.created_at}</p>
            <p><strong>更新时间:</strong> {userData.updated_at}</p>
            <p><strong>最后在线:</strong> {userData.last_seen}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">原始数据</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>
    </div>
  )
} 