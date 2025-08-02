'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestChatFix() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [matchedUsers, setMatchedUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [testMessage, setTestMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      alert('请先登录')
      router.push('/')
      return
    }

    const userData = JSON.parse(user)
    setCurrentUser(userData)
    loadMatchedUsers(token)
  }, [router])

  const loadMatchedUsers = async (token: string) => {
    try {
      const response = await fetch('/api/user/matched-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMatchedUsers(data.matchedUsers)
        }
      }
    } catch (error) {
      console.error('加载匹配用户失败:', error)
    }
  }

  const loadMessages = async (userId: string) => {
    if (!currentUser) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/messages/conversation?userId=${userId}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages || [])
        }
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !selectedUser) {
      alert('请输入消息并选择用户')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(selectedUser.id),
          message: testMessage,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('消息发送成功！')
          setTestMessage('')
          // 重新加载消息
          loadMessages(selectedUser.id)
        } else {
          alert('发送失败: ' + data.error)
        }
      } else {
        alert('发送失败')
      }
    } catch (error) {
      alert('发送出错: ' + error)
    }
  }

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    loadMessages(user.id)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">聊天修复测试</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">当前用户</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>ID:</strong> {currentUser?.id}</p>
                <p><strong>姓名:</strong> {currentUser?.name}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">测试状态</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>匹配用户:</strong> {matchedUsers.length} 个</p>
                <p><strong>选中用户:</strong> {selectedUser?.name || '无'}</p>
                <p><strong>消息数量:</strong> {messages.length} 条</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 用户列表 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">匹配用户</h2>
            <div className="space-y-2">
              {matchedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.age}岁 • {user.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">消息列表</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                选择用户查看消息
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.senderId === currentUser?.id?.toString()
                        ? 'bg-blue-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-500">
                        {message.senderId === currentUser?.id?.toString() ? '我' : '对方'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 发送消息 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">发送测试消息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  消息内容
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="输入测试消息..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              
              <button
                onClick={sendTestMessage}
                disabled={!testMessage.trim() || !selectedUser}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送消息
              </button>
              
              <div className="text-xs text-gray-500">
                <p>• 选择左侧用户开始聊天</p>
                <p>• 发送消息测试修复效果</p>
                <p>• 检查消息是否正确显示</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
