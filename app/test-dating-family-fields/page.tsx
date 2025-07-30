'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestDatingFamilyFields() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // 测试数据
  const [testData, setTestData] = useState({
    dating_style: 'long_term',
    relationship_goals: ['long_term'],
    family_plans: 'want_kids',
    has_kids: false // 使用布尔值而不是字符串
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未找到登录令牌')
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取用户资料失败')
      }

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      } else {
        setError(data.error || '获取用户资料失败')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTestData = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未找到登录令牌')
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessage('测试数据保存成功！')
          // 重新获取用户数据
          await fetchUserProfile()
        } else {
          setError('保存失败: ' + data.error)
        }
      } else {
        setError('请求失败，请重试')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6">测试约会目的和家庭计划字段</h1>
        
        {user && (
          <div className="space-y-6">
            {/* 当前用户数据 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">当前用户数据</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">dating_style:</span> 
                  <span className="ml-2 text-blue-600">
                    {user.dating_style ? `"${user.dating_style}"` : 'null/undefined'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">relationship_goals:</span> 
                  <span className="ml-2 text-blue-600">
                    {user.relationship_goals ? JSON.stringify(user.relationship_goals) : 'null/undefined'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">family_plans:</span> 
                  <span className="ml-2 text-green-600">
                    {user.family_plans ? `"${user.family_plans}"` : 'null/undefined'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">has_kids:</span> 
                  <span className="ml-2 text-green-600">
                    {user.has_kids !== undefined && user.has_kids !== null ? String(user.has_kids) : 'null/undefined'}
                  </span>
                </div>
              </div>
            </div>

            {/* 测试数据输入 */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">测试数据输入</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    dating_style
                  </label>
                  <select
                    value={testData.dating_style}
                    onChange={(e) => handleInputChange('dating_style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="long_term">长期关系</option>
                    <option value="life_partner">人生伴侣</option>
                    <option value="casual_dates">随意约会</option>
                    <option value="intimacy_no_commitment">肉体关系</option>
                    <option value="ethical_non_monogamy">开放式关系</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    relationship_goals
                  </label>
                  <input
                    type="text"
                    value={JSON.stringify(testData.relationship_goals)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        handleInputChange('relationship_goals', parsed)
                      } catch (error) {
                        // 忽略解析错误
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder='["long_term"]'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    family_plans
                  </label>
                  <select
                    value={testData.family_plans}
                    onChange={(e) => handleInputChange('family_plans', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="dont_want_kids">不想要孩子</option>
                    <option value="open_to_kids">对孩子持开放态度</option>
                    <option value="want_kids">想要孩子</option>
                    <option value="not_sure">不确定</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    has_kids
                  </label>
                  <select
                    value={testData.has_kids ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('has_kids', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="true">有孩子</option>
                    <option value="false">没有孩子</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveTestData}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {saving ? '保存中...' : '保存测试数据'}
                </button>
              </div>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{message}</p>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={fetchUserProfile}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            刷新数据
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
} 