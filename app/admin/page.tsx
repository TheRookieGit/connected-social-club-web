'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  gender: string
  location: string
  created_at: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser1, setSelectedUser1] = useState<number | null>(null)
  const [selectedUser2, setSelectedUser2] = useState<number | null>(null)
  const [matchScore, setMatchScore] = useState(0.95)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // 检查管理员权限并获取用户列表
  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      console.log('Admin页面: 开始权限检查...')
      
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      console.log('Admin页面: token存在:', !!token)
      console.log('Admin页面: user存在:', !!user)
      
      if (!token || !user) {
        console.log('Admin页面: 缺少token或user，跳转到首页')
        router.push('/')
        return
      }

      const userData = JSON.parse(user)
      console.log('Admin页面: 用户数据:', userData)
      console.log('Admin页面: 用户邮箱:', userData.email)
      
      if (userData.email !== 'admin@socialclub.com') {
        console.log('Admin页面: 非管理员用户，拒绝访问')
        setMessage(`只有管理员可以访问此页面，当前用户: ${userData.email}`)
        return
      }

      console.log('Admin页面: 管理员验证通过')
      setIsAdmin(true)
      await loadUsers(token)
    }

    checkAdminAndLoadUsers()
  }, [router])

  const loadUsers = async (token: string) => {
    try {
      const response = await fetch('/api/admin/force-match', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      } else {
        setMessage(data.error || '获取用户列表失败')
      }
    } catch (error) {
      setMessage('网络错误')
    }
  }

  const handleForceMatch = async () => {
    if (!selectedUser1 || !selectedUser2) {
      setMessage('请选择两个用户')
      return
    }

    if (selectedUser1 === selectedUser2) {
      setMessage('不能选择同一个用户')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/force-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId1: selectedUser1,
          userId2: selectedUser2,
          matchScore: matchScore
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessage(`✅ ${data.message}`)
        setSelectedUser1(null)
        setSelectedUser2(null)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ 网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">访问被拒绝</h1>
          <p className="text-gray-600">{message || '检查权限中...'}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理员控制面板</h1>
          <p className="text-gray-600">ConnectEd Elite Social Club管理后台</p>
        </div>

        {/* 快速操作卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">用户管理</h3>
            <p className="text-gray-600 text-sm mb-4">管理所有注册用户</p>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-500">总用户数</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">聊天记录</h3>
            <p className="text-gray-600 text-sm mb-4">查看所有聊天记录</p>
            <a 
              href="/admin-chat" 
              className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              管理聊天记录
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">调试工具</h3>
            <p className="text-gray-600 text-sm mb-4">系统调试和测试</p>
            <a 
              href="/debug-admin" 
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              调试工具
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">系统状态</h3>
            <p className="text-gray-600 text-sm mb-4">系统运行状态</p>
            <div className="text-2xl font-bold text-green-600">运行中</div>
            <div className="text-sm text-gray-500">系统正常</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 强制匹配功能 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">强制匹配用户</h2>
            
            {/* 用户选择 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择用户1
                </label>
                <select
                  value={selectedUser1 || ''}
                  onChange={(e) => setSelectedUser1(Number(e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">请选择用户</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.gender} - {user.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择用户2
                </label>
                <select
                  value={selectedUser2 || ''}
                  onChange={(e) => setSelectedUser2(Number(e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">请选择用户</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.gender} - {user.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  匹配分数 (0-1)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={matchScore}
                  onChange={(e) => setMatchScore(parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <button
                onClick={handleForceMatch}
                disabled={loading || !selectedUser1 || !selectedUser2}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '强制匹配'}
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* 用户列表 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">用户列表</h2>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      {user.gender} · {user.location} · ID: {user.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">使用说明</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 选择两个不同的用户进行强制匹配</li>
            <li>• 匹配分数范围是 0-1，默认为 0.95</li>
            <li>• 强制匹配会创建双向的 &quot;accepted&quot; 状态匹配记录</li>
            <li>• 系统会检查用户是否已经存在匹配关系</li>
            <li>• 所有操作都会记录在活动日志中</li>
            <li>• 点击&quot;管理聊天记录&quot;可以查看和管理所有用户的聊天内容</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 