'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugAdmin() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [matchesInfo, setMatchesInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      const info = {
        hasToken: !!token,
        hasUser: !!user,
        token: token ? token.substring(0, 20) + '...' : null,
        userData: user ? JSON.parse(user) : null,
        isAdmin: false,
        currentUrl: window.location.href
      }

      if (user) {
        const userData = JSON.parse(user)
        info.isAdmin = userData.email === 'admin@socialclub.com'
      }

      setDebugInfo(info)
    }

    checkAuth()
  }, [])

  const forceLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@socialclub.com',
          password: 'password'
        })
      })

      const data = await response.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.reload()
      } else {
        alert('登录失败: ' + data.error)
      }
    } catch (error) {
      alert('网络错误: ' + error)
    }
  }

  const checkMatches = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }

      const response = await fetch('/api/debug/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setMatchesInfo(data)
      } else {
        alert('获取匹配记录失败: ' + data.error)
      }
    } catch (error) {
      alert('网络错误: ' + error)
    }
  }

  const clearAllMatches = async () => {
    if (!confirm('确定要清除所有匹配记录吗？这个操作不可撤销！')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/fix-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'clear_all' })
      })

      const data = await response.json()
      if (data.success) {
        alert('✅ ' + data.message)
        checkMatches() // 刷新匹配记录
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      alert('网络错误: ' + error)
    }
  }

  const createTestMatch = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 首先获取用户列表，选择前两个用户进行测试匹配
      const usersResponse = await fetch('/api/admin/force-match', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!usersResponse.ok) {
        alert('❌ 无法获取用户列表')
        return
      }
      
      const usersData = await usersResponse.json()
      if (!usersData.success || !usersData.users || usersData.users.length < 2) {
        alert('❌ 需要至少2个用户才能创建测试匹配')
        return
      }
      
      const user1 = usersData.users[0]
      const user2 = usersData.users[1]
      
      const response = await fetch('/api/admin/fix-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: 'create_test_match',
          userId1: user1.id,
          userId2: user2.id
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`✅ 成功创建 ${user1.name} 和 ${user2.name} 的测试匹配`)
        checkMatches() // 刷新匹配记录
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      alert('网络错误: ' + error)
    }
  }

  const forceFixMatches = async () => {
    if (!confirm('这将清除所有匹配记录并重新创建！确定继续吗？')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/force-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        alert('✅ ' + data.message)
        checkMatches() // 刷新匹配记录
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      alert('网络错误: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">管理员功能调试页面</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">当前状态</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">快速操作</h3>
            
            <div className="space-y-3">
              <button
                onClick={forceLogin}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                强制以管理员身份登录
              </button>
              
              <button
                onClick={() => router.push('/admin')}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                disabled={!debugInfo.isAdmin}
              >
                访问管理员控制台
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                返回仪表板
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                清除所有数据
              </button>
              
              <button
                onClick={checkMatches}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                disabled={!debugInfo.hasToken}
              >
                检查匹配记录
              </button>
              
              <button
                onClick={clearAllMatches}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
                disabled={!debugInfo.isAdmin}
              >
                清除所有匹配记录
              </button>
              
              <button
                onClick={createTestMatch}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                disabled={!debugInfo.isAdmin}
              >
                创建测试匹配
              </button>
              
              <button
                onClick={forceFixMatches}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                disabled={!debugInfo.isAdmin}
              >
                🔧 强力修复匹配系统
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">状态检查</h3>
            
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${debugInfo.hasToken ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Token: {debugInfo.hasToken ? '✅ 存在' : '❌ 缺失'}
              </div>
              
              <div className={`p-2 rounded ${debugInfo.hasUser ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                用户信息: {debugInfo.hasUser ? '✅ 存在' : '❌ 缺失'}
              </div>
              
              <div className={`p-2 rounded ${debugInfo.isAdmin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                管理员权限: {debugInfo.isAdmin ? '✅ 是管理员' : '❌ 非管理员'}
              </div>
              
              {debugInfo.userData && (
                <div className="p-2 rounded bg-blue-100 text-blue-700">
                  当前用户: {debugInfo.userData.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 匹配记录信息 */}
        {matchesInfo && (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">匹配记录信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-blue-600">{matchesInfo.totalMatches}</div>
                <div className="text-sm text-blue-700">总匹配数</div>
              </div>
              <div className="bg-green-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-green-600">{matchesInfo.acceptedMatches}</div>
                <div className="text-sm text-green-700">已接受</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-yellow-600">{matchesInfo.pendingMatches}</div>
                <div className="text-sm text-yellow-700">等待中</div>
              </div>
              <div className="bg-red-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-red-600">{matchesInfo.rejectedMatches}</div>
                <div className="text-sm text-red-700">已拒绝</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">所有匹配记录</h3>
              <div className="max-h-64 overflow-y-auto">
                {matchesInfo.allMatches.map((match: any, index: number) => (
                  <div key={index} className="border-b py-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>{match.user} → {match.matchedUser}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        match.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        match.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      分数: {match.score} | 创建时间: {new Date(match.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">使用说明</h3>
          <ol className="text-yellow-700 space-y-1">
            <li>1. 如果没有管理员权限，点击"强制以管理员身份登录"</li>
            <li>2. 点击"检查匹配记录"查看当前数据库状态</li>
            <li>3. <strong>如果"已接受"数量为0，点击"🔧 强力修复匹配系统"</strong></li>
            <li>4. 等待修复完成，再次检查匹配记录</li>
            <li>5. 刷新仪表板页面，点击聊天图标查看匹配用户</li>
          </ol>
          
          <div className="mt-4 p-3 bg-red-100 rounded">
            <p className="text-red-700 text-sm">
              <strong>推荐：</strong>如果匹配功能不正常，直接使用"强力修复匹配系统"一键解决所有问题！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 