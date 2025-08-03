'use client'

import { useState, useEffect } from 'react'
import StreamChatPanel from '@/components/StreamChatPanel'

export default function TestUserList() {
  const [matchedUsers, setMatchedUsers] = useState<any[]>([])
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    // 模拟一些测试用户数据
    const testUsers = [
      {
        id: '1',
        name: '张三',
        age: 25,
        gender: 'female',
        location: '北京',
        bio: '喜欢旅行和摄影',
        occupation: '设计师',
        avatar_url: null,
        photos: [],
        isOnline: true,
        lastSeen: new Date().toISOString(),
        matchScore: 85,
        matchedAt: new Date().toISOString(),
        initiatedByMe: false
      },
      {
        id: '2',
        name: '李四',
        age: 28,
        gender: 'female',
        location: '上海',
        bio: '热爱音乐和美食',
        occupation: '教师',
        avatar_url: null,
        photos: [],
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        matchScore: 92,
        matchedAt: new Date().toISOString(),
        initiatedByMe: true
      },
      {
        id: '3',
        name: '王五',
        age: 26,
        gender: 'female',
        location: '广州',
        bio: '运动爱好者',
        occupation: '健身教练',
        avatar_url: null,
        photos: [],
        isOnline: true,
        lastSeen: new Date().toISOString(),
        matchScore: 78,
        matchedAt: new Date().toISOString(),
        initiatedByMe: false
      },
      {
        id: '4',
        name: '赵六',
        age: 24,
        gender: 'female',
        location: '深圳',
        bio: '程序员，喜欢编程',
        occupation: '软件工程师',
        avatar_url: null,
        photos: [],
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000).toISOString(),
        matchScore: 88,
        matchedAt: new Date().toISOString(),
        initiatedByMe: true
      },
      {
        id: '5',
        name: '钱七',
        age: 27,
        gender: 'female',
        location: '杭州',
        bio: '艺术工作者',
        occupation: '画家',
        avatar_url: null,
        photos: [],
        isOnline: true,
        lastSeen: new Date().toISOString(),
        matchScore: 95,
        matchedAt: new Date().toISOString(),
        initiatedByMe: false
      }
    ]

    setMatchedUsers(testUsers)
  }, [])

  const addUser = () => {
    const newUser = {
      id: (matchedUsers.length + 1).toString(),
      name: `用户${matchedUsers.length + 1}`,
      age: 20 + Math.floor(Math.random() * 15),
      gender: 'female',
      location: '测试城市',
      bio: '测试用户',
      occupation: '测试职业',
      avatar_url: null,
      photos: [],
      isOnline: Math.random() > 0.5,
      lastSeen: new Date().toISOString(),
      matchScore: 70 + Math.floor(Math.random() * 30),
      matchedAt: new Date().toISOString(),
      initiatedByMe: Math.random() > 0.5
    }
    setMatchedUsers([...matchedUsers, newUser])
  }

  const removeUser = () => {
    if (matchedUsers.length > 0) {
      setMatchedUsers(matchedUsers.slice(0, -1))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">用户列表测试页面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={addUser}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              添加用户
            </button>
            <button
              onClick={removeUser}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              移除用户
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {showChat ? '隐藏' : '显示'}聊天面板
            </button>
          </div>
          
                     <div className="text-sm text-gray-600">
             <p>当前用户数量: {matchedUsers.length}</p>
             <p>预期列表高度: {Math.min(matchedUsers.length * 80 + 100, 800)}px</p>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">用户列表</h2>
          <div className="space-y-2">
            {matchedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.age}岁 • {user.location}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isOnline ? '在线' : '离线'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

                 <div className="mt-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
           <strong>说明:</strong> 
           <ul className="mt-2 list-disc list-inside space-y-1">
             <li>用户列表现在位于页面右下角，尺寸已扩大</li>
             <li>列表宽度从192px增加到320px</li>
             <li>列表高度会根据用户数量动态调整</li>
             <li>最大高度为屏幕高度的80%</li>
             <li>最小高度为300px</li>
             <li>每个用户项大约80px高度</li>
             <li>用户头像从40px增加到48px</li>
             <li>标题已改为"我的匹配"，图标在文字前面</li>
             <li>显示用户个人简介而不是在线状态</li>
             <li>聊天框现在位于"我的匹配"用户列表的左侧</li>
           </ul>
         </div>
      </div>

      {/* 聊天面板 */}
      {showChat && (
        <StreamChatPanel
          matchedUsers={matchedUsers}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
} 