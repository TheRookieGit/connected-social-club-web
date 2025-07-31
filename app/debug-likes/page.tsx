'use client'

import { useState, useEffect } from 'react'

export default function DebugLikesPage() {
  const [likedUsers, setLikedUsers] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    // 从localStorage读取喜欢用户列表
    const stored = localStorage.getItem('likedUsers')
    if (stored) {
      setLikedUsers(JSON.parse(stored))
    }

    // 获取当前用户ID（从token中解析）
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUserId(payload.sub || 'unknown')
      } catch (error) {
        console.error('解析token失败:', error)
      }
    }
  }, [])

  const clearLikes = () => {
    localStorage.removeItem('likedUsers')
    setLikedUsers([])
  }

  const addTestLike = () => {
    const testUserId = 'test-user-' + Date.now()
    const newLikedUsers = [...likedUsers, testUserId]
    localStorage.setItem('likedUsers', JSON.stringify(newLikedUsers))
    setLikedUsers(newLikedUsers)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">喜欢状态调试</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold mb-2">当前用户ID</h2>
            <p className="text-sm text-gray-600">{currentUserId || '未获取到'}</p>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-semibold mb-2">已喜欢的用户 ({likedUsers.length})</h2>
            {likedUsers.length > 0 ? (
              <ul className="space-y-1">
                {likedUsers.map((userId, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {userId}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">暂无喜欢的用户</p>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h2 className="font-semibold mb-2">操作</h2>
            <div className="space-x-2">
              <button
                onClick={clearLikes}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                清空所有喜欢
              </button>
              <button
                onClick={addTestLike}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                添加测试喜欢
              </button>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <h2 className="font-semibold mb-2">LocalStorage 原始数据</h2>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {localStorage.getItem('likedUsers') || 'null'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 