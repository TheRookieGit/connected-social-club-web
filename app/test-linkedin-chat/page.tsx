'use client'

import { useState, useEffect } from 'react'
import LinkedInStyleChatPanel from '@/components/LinkedInStyleChatPanel'

export default function TestLinkedInChat() {
  const [showChat, setShowChat] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          const userData = data.user || data
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  // 获取匹配用户
  useEffect(() => {
    const fetchMatchedUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/user/matched-users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setMatchedUsers(data.users || [])
          }
        }
      } catch (error) {
        console.error('获取匹配用户失败:', error)
      }
    }

    if (currentUser) {
      fetchMatchedUsers()
    }
  }, [currentUser])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            LinkedIn风格聊天浮窗测试
          </h1>
          <p className="text-gray-600 mb-6">
            这是一个模拟LinkedIn消息浮窗的聊天界面，位于右下角，包含对话列表和用户搜索功能。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">功能特性</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• 右下角浮窗设计</li>
                <li>• 最小化/最大化功能</li>
                <li>• 左侧对话列表</li>
                <li>• 右侧用户搜索</li>
                <li>• 实时消息更新</li>
                <li>• 置顶/删除对话</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">当前状态</h3>
              <div className="space-y-2 text-sm text-green-800">
                <div>• 当前用户: {currentUser?.name || '未登录'}</div>
                <div>• 匹配用户数: {matchedUsers.length}</div>
                <div>• 聊天状态: {showChat ? '已打开' : '已关闭'}</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowChat(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              打开聊天浮窗
            </button>
            <button
              onClick={() => setShowChat(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              关闭聊天浮窗
            </button>
          </div>
        </div>

        {/* 模拟内容区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">模拟页面内容</h2>
          <p className="text-gray-600 mb-6">
            这是页面的主要内容区域。聊天浮窗会显示在右下角，不会影响页面的正常布局。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">内容卡片 {i}</h3>
                <p className="text-gray-600 text-sm">
                  这是第 {i} 个内容卡片，用于模拟真实页面的内容布局。
                  聊天浮窗会浮动在这些内容之上。
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LinkedIn风格聊天浮窗 */}
      {showChat && (
        <LinkedInStyleChatPanel
          matchedUsers={matchedUsers}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
} 