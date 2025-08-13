'use client'

import { useState, useEffect } from 'react'
import LinkedInStyleChatPanel from '@/components/LinkedInStyleChatPanel'

export default function DemoLinkedInChat() {
  const [showChat, setShowChat] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 获取匹配用户
  useEffect(() => {
    const fetchMatchedUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }

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
      } finally {
        setLoading(false)
      }
    }

    fetchMatchedUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">社交俱乐部</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                打开聊天
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              LinkedIn风格聊天浮窗演示
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">功能特点</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 右下角浮窗设计，不占用页面空间</li>
                  <li>• 左侧显示对话列表，右侧显示聊天窗口</li>
                  <li>• 支持用户搜索和新建对话</li>
                  <li>• 实时消息更新和在线状态显示</li>
                  <li>• 最小化/最大化/关闭功能</li>
                  <li>• 对话置顶和删除功能</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">当前状态</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 匹配用户数: {loading ? '加载中...' : matchedUsers.length}</div>
                  <div>• 聊天状态: {showChat ? '已打开' : '已关闭'}</div>
                  <div>• 组件状态: 正常</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                打开聊天浮窗
              </button>
              <button
                onClick={() => setShowChat(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                关闭聊天浮窗
              </button>
            </div>
          </div>

          {/* 模拟内容区域 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">内容卡片 {i}</h3>
                <p className="text-gray-600 text-sm">
                  这是页面的主要内容区域。聊天浮窗会显示在右下角，不会影响这些内容的显示。
                  您可以继续浏览页面内容，同时保持聊天窗口打开。
                </p>
              </div>
            ))}
          </div>

          {/* 更多内容 */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">使用说明</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. 点击&ldquo;打开聊天浮窗&rdquo;按钮启动聊天界面</p>
              <p>2. 在搜索框中输入用户名搜索并开始对话</p>
              <p>3. 点击左侧对话列表中的用户进行聊天</p>
              <p>4. 使用右上角的按钮控制窗口大小或关闭</p>
              <p>5. 聊天窗口会浮动在页面内容之上，不影响正常浏览</p>
            </div>
          </div>
        </div>
      </main>

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