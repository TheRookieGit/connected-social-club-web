'use client'

import { useState, useEffect } from 'react'

export default function TestApiData() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('没有找到登录token')
          setLoading(false)
          return
        }

        const response = await fetch('/api/user/matches?limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.users.length > 0) {
            setUserData(data.users[0])
          } else {
            setError('没有获取到用户数据')
          }
        } else {
          setError(`API请求失败: ${response.status}`)
        }
      } catch (error) {
        setError(`网络错误: ${error}`)
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API数据测试</h1>
      
      {userData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">用户数据详情</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">基本信息</h3>
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {userData.id}</div>
                <div><strong>姓名:</strong> {userData.name}</div>
                <div><strong>生日:</strong> {userData.birth_date}</div>
                <div><strong>性别:</strong> {userData.gender}</div>
                <div><strong>位置:</strong> {userData.location}</div>
                <div><strong>简介:</strong> {userData.bio}</div>
                <div><strong>头像:</strong> {userData.avatar_url}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">扩展字段</h3>
              <div className="space-y-2 text-sm">
                <div><strong>职业:</strong> {userData.occupation || '未填写'}</div>
                <div><strong>教育:</strong> {userData.education || '未填写'}</div>
                <div><strong>关系状态:</strong> {userData.relationship_status || '未填写'}</div>
                <div><strong>身高:</strong> {userData.height || '未填写'}</div>
                <div><strong>体重:</strong> {userData.weight || '未填写'}</div>
                <div><strong>种族:</strong> {userData.ethnicity || '未填写'}</div>
                <div><strong>宗教:</strong> {userData.religion || '未填写'}</div>
                <div><strong>雇主:</strong> {userData.employer || '未填写'}</div>
                <div><strong>学校:</strong> {userData.school || '未填写'}</div>
                <div><strong>学位:</strong> {userData.degree || '未填写'}</div>
                <div><strong>性格类型:</strong> {userData.personality_type || '未填写'}</div>
                <div><strong>家庭计划:</strong> {userData.family_plans || '未填写'}</div>
                <div><strong>是否有孩子:</strong> {userData.has_kids ? '是' : '否'}</div>
                <div><strong>吸烟状态:</strong> {userData.smoking_status || '未填写'}</div>
                <div><strong>饮酒状态:</strong> {userData.drinking_status || '未填写'}</div>
                <div><strong>约会风格:</strong> {userData.dating_style || '未填写'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">数组字段</h3>
              <div className="space-y-2 text-sm">
                <div><strong>兴趣:</strong> {userData.interests ? userData.interests.join(', ') : '无'}</div>
                <div><strong>价值观偏好:</strong> {userData.values_preferences ? userData.values_preferences.join(', ') : '无'}</div>
                <div><strong>语言:</strong> {userData.languages ? userData.languages.join(', ') : '无'}</div>
                <div><strong>关系目标:</strong> {userData.relationship_goals ? userData.relationship_goals.join(', ') : '无'}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">其他信息</h3>
              <div className="space-y-2 text-sm">
                <div><strong>在线状态:</strong> {userData.is_online ? '在线' : '离线'}</div>
                <div><strong>最后在线:</strong> {userData.last_seen}</div>
                <div><strong>已验证:</strong> {userData.is_verified ? '是' : '否'}</div>
                <div><strong>高级用户:</strong> {userData.is_premium ? '是' : '否'}</div>
                <div><strong>创建时间:</strong> {userData.created_at}</div>
                <div><strong>匹配分数:</strong> {userData.matchScore}%</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">原始JSON数据</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 