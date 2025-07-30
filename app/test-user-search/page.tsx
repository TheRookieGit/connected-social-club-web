'use client'

import { useState } from 'react'

export default function TestUserSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('请先登录')
      }

      const response = await fetch(`/api/user/search?q=${encodeURIComponent(searchTerm)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.users)
      } else {
        throw new Error(data.error || '搜索失败')
      }
    } catch (error) {
      console.error('搜索错误:', error)
      setError(error instanceof Error ? error.message : '搜索失败')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">用户搜索测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">搜索结果 ({searchResults.length})</h2>
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg ${
                    user.canStartChat ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold">
                    {user.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.name || '未知用户'}</h3>
                      {user.isMatched && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                          已匹配
                        </span>
                      )}
                      {!user.isMatched && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full">
                          未匹配
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.location && <p className="text-sm text-gray-500">📍 {user.location}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      用户ID: {user.id} • 
                      {user.canStartChat ? ' 可以开始聊天' : ' 需要先匹配才能聊天'}
                    </p>
                  </div>
                  <div className="text-right">
                    {user.is_online && (
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
