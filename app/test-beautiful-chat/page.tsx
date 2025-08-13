'use client'

import { useState } from 'react'
import BeautifulChatPanel from '@/components/BeautifulChatPanel'

// 模拟匹配用户数据
const mockMatchedUsers = [
  {
    id: '1',
    name: '小红',
    age: 25,
    location: '北京朝阳区',
    bio: '喜欢旅行和摄影的文艺女青年',
    interests: ['旅行', '摄影', '音乐'],
    photos: ['/api/placeholder/400/600'],
    isOnline: true
  },
  {
    id: '2',
    name: '小美',
    age: 23,
    location: '上海浦东新区',
    bio: '热爱美食和健身的阳光女孩',
    interests: ['美食', '健身', '电影'],
    photos: ['/api/placeholder/400/600'],
    isOnline: false
  },
  {
    id: '3',
    name: '小丽',
    age: 27,
    location: '深圳南山区',
    bio: 'IT行业的独立女性，喜欢阅读和咖啡',
    interests: ['阅读', '咖啡', '编程'],
    photos: ['/api/placeholder/400/600'],
    isOnline: true
  },
  {
    id: '4',
    name: '小芳',
    age: 24,
    location: '广州天河区',
    bio: '设计师，热爱艺术和手工制作',
    interests: ['艺术', '手工', '设计'],
    photos: ['/api/placeholder/400/600'],
    isOnline: false
  },
  {
    id: '5',
    name: '小雅',
    age: 26,
    location: '杭州西湖区',
    bio: '瑜伽老师，追求身心平衡的生活方式',
    interests: ['瑜伽', '冥想', '自然'],
    photos: ['/api/placeholder/400/600'],
    isOnline: true
  }
]

export default function TestBeautifulChat() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">美观聊天UI测试</h1>
          <p className="text-lg text-gray-600">点击下方按钮体验全新的粉红色调聊天界面</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowChat(true)}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
          >
            🎨 打开美观聊天
          </button>
          
          <div className="text-sm text-gray-500 space-y-2">
            <p>✨ 功能特色：</p>
            <ul className="space-y-1">
              <li>• 粉红色调主题设计</li>
              <li>• 删除对话功能</li>
              <li>• 置顶对话功能</li>
              <li>• 未读消息数量提示</li>
              <li>• 标为未读/已读功能</li>
              <li>• 搜索和过滤功能</li>
              <li>• 实时消息状态</li>
            </ul>
          </div>
        </div>
      </div>

      {showChat && (
        <BeautifulChatPanel
          matchedUsers={mockMatchedUsers}
          onClose={() => setShowChat(false)}
          isOpen={showChat}
        />
      )}
    </div>
  )
} 