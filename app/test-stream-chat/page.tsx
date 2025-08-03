'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// 动态导入Stream Chat组件
const StreamChatPanel = dynamic(() => import('@/components/StreamChatPanel'), {
  ssr: false,
  loading: () => <div>加载聊天中...</div>
})

// 模拟匹配用户数据
const mockMatchedUsers = [
  {
    id: '1',
    name: '测试用户1',
    age: 25,
    location: '北京',
    bio: '这是一个测试用户',
    interests: ['音乐', '旅行'],
    photos: ['https://via.placeholder.com/150'],
    isOnline: true
  },
  {
    id: '2',
    name: '测试用户2',
    age: 28,
    location: '上海',
    bio: '另一个测试用户',
    interests: ['电影', '美食'],
    photos: ['https://via.placeholder.com/150'],
    isOnline: false
  }
]

export default function TestStreamChat() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Stream Chat 测试页面</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <p className="text-gray-600 mb-4">
            这个页面用于测试 Stream Chat 功能。点击下面的按钮来打开聊天面板。
          </p>
          
          <button
            onClick={() => setShowChat(true)}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            打开 Stream Chat
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">匹配用户列表</h2>
          <div className="space-y-4">
            {mockMatchedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.bio}</p>
                </div>
                <div className="ml-auto">
                  <span className={`inline-block w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stream Chat 面板 */}
      {showChat && (
        <StreamChatPanel
          matchedUsers={mockMatchedUsers}
          onClose={() => setShowChat(false)}
          isOpen={showChat}
          position="left"
        />
      )}
    </div>
  )
} 