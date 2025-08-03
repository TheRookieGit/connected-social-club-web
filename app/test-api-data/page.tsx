'use client'

import { useState, useEffect } from 'react'

export default function TestApiData() {
  const [userData, setUserData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('没有找到登录token')
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/matched-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.matchedUsers && data.matchedUsers.length > 0) {
          setUserData(data.matchedUsers)
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

  // 生活方式字段映射
  const getLifestyleDisplayName = (field: string, value: string) => {
    const mappings: { [key: string]: { [key: string]: string } } = {
      family_plans: {
        'want_kids': '想要孩子',
        'dont_want_kids': '不想要孩子',
        'open_to_kids': '对孩子持开放态度',
        'not_sure': '不确定'
      },
                          smoking_status: {
                      'yes_smoke': '是的，我吸烟',
                      'sometimes_smoke': '我有时吸烟',
                      'no_smoke': '不，我不吸烟',
                      'trying_quit': '我正在尝试戒烟'
                    },
                    drinking_status: {
                      'yes_drink': '是的，我喝酒',
                      'sometimes_drink': '我有时喝酒',
                      'rarely_drink': '我很少喝酒',
                      'no_drink': '不，我不喝酒',
                      'sober': '我戒酒了'
                    },
      dating_style: {
        'long_term': '长期关系',
        'life_partner': '人生伴侣',
        'casual_dates': '有趣的随意约会',
        'intimacy_no_commitment': '肉体关系'
      }
    }

    return mappings[field]?.[value] || value
  }

  useEffect(() => {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API数据测试</h1>
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            fetchUserData()
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          刷新数据
        </button>
      </div>
      
      {userData.length > 0 && (
        <div className="space-y-6">
          {userData.map((user, index) => (
            <div key={user.id} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">用户 {index + 1} 数据详情</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">基本信息</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>姓名:</strong> {user.name}</div>
                    <div><strong>生日:</strong> {user.birth_date}</div>
                    <div><strong>性别:</strong> {user.gender}</div>
                    <div><strong>位置:</strong> {user.location}</div>
                    <div><strong>简介:</strong> {user.bio}</div>
                    <div><strong>头像:</strong> {user.avatar_url}</div>
                    <div><strong>照片数组:</strong> {user.photos ? JSON.stringify(user.photos) : '无'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">扩展字段</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>职业:</strong> {user.occupation || '未填写'}</div>
                    <div><strong>教育:</strong> {user.education || '未填写'}</div>
                    <div><strong>关系状态:</strong> {user.relationship_status || '未填写'}</div>
                    <div><strong>身高:</strong> {user.height || '未填写'}</div>
                    <div><strong>体重:</strong> {user.weight || '未填写'}</div>
                    <div><strong>种族:</strong> {user.ethnicity || '未填写'}</div>
                    <div><strong>宗教:</strong> {user.religion || '未填写'}</div>
                    <div><strong>雇主:</strong> {user.employer || '未填写'}</div>
                    <div><strong>学校:</strong> {user.school || '未填写'}</div>
                    <div><strong>学位:</strong> {user.degree || '未填写'}</div>
                    <div><strong>性格类型:</strong> {user.personality_type || '未填写'}</div>
                    <div><strong>家庭计划:</strong> {user.family_plans ? getLifestyleDisplayName('family_plans', user.family_plans) : '未填写'}</div>
                    <div><strong>是否有孩子:</strong> {user.has_kids ? '是' : '否'}</div>
                    <div><strong>吸烟状态:</strong> {user.smoking_status ? getLifestyleDisplayName('smoking_status', user.smoking_status) : '未填写'}</div>
                    <div><strong>饮酒状态:</strong> {user.drinking_status ? getLifestyleDisplayName('drinking_status', user.drinking_status) : '未填写'}</div>
                    <div><strong>约会风格:</strong> {user.dating_style ? getLifestyleDisplayName('dating_style', user.dating_style) : '未填写'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">数组字段</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>兴趣:</strong> {user.interests ? user.interests.join(', ') : '无'}</div>
                    <div><strong>价值观偏好:</strong> {user.values_preferences ? user.values_preferences.join(', ') : '无'}</div>
                    <div><strong>语言:</strong> {user.languages ? user.languages.join(', ') : '无'}</div>
                    <div><strong>关系目标:</strong> {user.relationship_goals ? user.relationship_goals.join(', ') : '无'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">其他信息</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>在线状态:</strong> {user.is_online ? '在线' : '离线'}</div>
                    <div><strong>最后在线:</strong> {user.last_seen}</div>
                    <div><strong>已验证:</strong> {user.is_verified ? '是' : '否'}</div>
                    <div><strong>高级用户:</strong> {user.is_premium ? '是' : '否'}</div>
                    <div><strong>创建时间:</strong> {user.created_at}</div>
                    <div><strong>匹配分数:</strong> {user.matchScore}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">原始JSON数据</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 