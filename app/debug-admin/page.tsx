'use client'

import { useState } from 'react'

export default function DebugAdmin() {
  const [loading, setLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createTestMatches = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        setMessage('❌ 请先登录')
        return
      }
      
      const userData = JSON.parse(user)
      
      const response = await fetch('/api/admin/create-test-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: userData.id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ 操作失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createPendingMatches = async () => {
    setPendingLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        setMessage('❌ 请先登录')
        return
      }
      
      const userData = JSON.parse(user)
      
      // 获取其他用户并为他们创建对当前用户的pending匹配
      const usersResponse = await fetch('/api/user/matches?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!usersResponse.ok) {
        setMessage('❌ 无法获取用户列表')
        return
      }
      
      const usersData = await usersResponse.json()
      if (!usersData.success || !usersData.users || usersData.users.length === 0) {
        setMessage('❌ 没有找到其他用户')
        return
      }
      
      // 为前3个用户创建对当前用户的pending匹配
      const matchesToCreate = []
      for (let i = 0; i < Math.min(3, usersData.users.length); i++) {
        const otherUser = usersData.users[i]
        
        // 创建其他用户对当前用户的pending匹配
        matchesToCreate.push({
          user_id: otherUser.id,
          matched_user_id: userData.id,
          match_status: 'pending',
          match_score: 0.7 + Math.random() * 0.3
        })
      }
      
      // 直接插入数据库（使用管理员权限）
      const response = await fetch('/api/admin/create-pending-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matches: matchesToCreate
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ 成功创建了 ${matchesToCreate.length} 个待接受匹配！`)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ 操作失败: ${error}`)
    } finally {
      setPendingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">调试工具</h1>
        
        <div className="space-y-6">
          {/* 创建已匹配数据 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">创建已匹配数据</h2>
            <p className="text-gray-600 mb-6">
              为当前登录用户创建一些已接受的双向匹配，用于测试"我的匹配"功能
            </p>
            
            <button
              onClick={createTestMatches}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建已匹配数据'}
            </button>
          </div>

          {/* 创建待接受匹配数据 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">创建待接受匹配数据</h2>
            <p className="text-gray-600 mb-6">
              创建其他用户对你的待接受匹配请求，用于测试"待接受匹配"功能
            </p>
            
            <button
              onClick={createPendingMatches}
              disabled={pendingLoading}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {pendingLoading ? '创建中...' : '创建待接受匹配'}
            </button>
          </div>
        </div>
        
        {message && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">使用说明：</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. 确保已登录系统</li>
            <li>2. 点击"创建已匹配数据"按钮创建一些已确认的匹配</li>
            <li>3. 点击"创建待接受匹配"按钮创建一些待处理的匹配请求</li>
            <li>4. 返回仪表板查看两种匹配功能</li>
            <li>5. 紫色按钮查看待接受匹配，红色按钮查看已匹配用户</li>
          </ol>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">功能说明：</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>已匹配数据</strong>：双方都喜欢对方，可以直接聊天</li>
            <li>• <strong>待接受匹配</strong>：其他用户喜欢你，等待你的回应</li>
            <li>• <strong>处理流程</strong>：接受待匹配后，会自动变成已匹配状态</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 