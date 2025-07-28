'use client'

import { useState, useEffect } from 'react'

export default function EmergencyChatFix() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const addResult = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    setResults(prev => [...prev, { type, message, timestamp: new Date() }])
  }

  const runEmergencyTest = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('info', '🚨 紧急修复验证开始...')
      
      // 1. 检查登录
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        addResult('error', '❌ 请先登录')
        return
      }
      
      const userData = JSON.parse(user)
      addResult('success', `✅ 已登录: ${userData.name}`)
      
      // 2. 获取匹配用户
      const matchResponse = await fetch('/api/user/matched-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!matchResponse.ok) {
        addResult('error', '❌ 获取匹配用户失败')
        return
      }
      
      const matchData = await matchResponse.json()
      if (!matchData.success || !matchData.matchedUsers.length) {
        addResult('error', '❌ 没有匹配用户')
        return
      }
      
      const targetUser = matchData.matchedUsers[0]
      setSelectedUser(targetUser)
      addResult('success', `✅ 目标用户: ${targetUser.name}`)
      
      // 3. 发送测试消息
      const testMsg = `紧急修复测试 ${new Date().toLocaleTimeString()}`
      addResult('info', `📤 发送消息: "${testMsg}"`)
      
      const sendResponse = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(targetUser.id),
          message: testMsg,
          messageType: 'text'
        })
      })
      
      if (!sendResponse.ok) {
        addResult('error', '❌ 消息发送失败')
        return
      }
      
      const sendData = await sendResponse.json()
      if (!sendData.success) {
        addResult('error', `❌ 消息发送失败: ${sendData.error}`)
        return
      }
      
      addResult('success', `✅ 消息发送成功 - ID: ${sendData.data.id}`)
      
      // 4. 立即验证消息保存
      addResult('info', '📥 验证消息保存...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const getResponse = await fetch(`/api/messages/conversation?userId=${targetUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!getResponse.ok) {
        addResult('error', '❌ 获取聊天记录失败')
        return
      }
      
      const getData = await getResponse.json()
      if (!getData.success) {
        addResult('error', `❌ 获取聊天记录失败: ${getData.error}`)
        return
      }
      
      const foundMessage = getData.messages.find((msg: any) => 
        msg.id.toString() === sendData.data.id.toString()
      )
      
      if (foundMessage) {
        addResult('success', `✅ 消息已正确保存`)
        addResult('info', `📊 总消息数: ${getData.messages.length}`)
        addResult('info', `📖 已读状态: ${foundMessage.isRead ? '已读' : '未读'}`)
      } else {
        addResult('error', `❌ 消息未找到 - 消息被吞掉了！`)
        addResult('info', `🔍 查找ID: ${sendData.data.id}`)
        addResult('info', `📋 现有消息: ${getData.messages.map((m: any) => m.id).join(', ')}`)
      }
      
      // 5. 等待并再次检查（确保不会被后续操作覆盖）
      addResult('info', '⏳ 等待5秒后再次检查...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const finalResponse = await fetch(`/api/messages/conversation?userId=${targetUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (finalResponse.ok) {
        const finalData = await finalResponse.json()
        if (finalData.success) {
          const stillExists = finalData.messages.find((msg: any) => 
            msg.id.toString() === sendData.data.id.toString()
          )
          
          if (stillExists) {
            addResult('success', `🎉 修复成功！消息依然存在`)
            addResult('info', `📖 最终已读状态: ${stillExists.isRead ? '已读' : '未读'}`)
          } else {
            addResult('error', `💥 消息在5秒后被吞掉了！`)
          }
        }
      }
      
    } catch (error) {
      addResult('error', `❌ 测试异常: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">🚨 紧急聊天修复验证</h1>
          <p className="text-red-700 mb-4">
            此工具专门用于验证聊天消息被&quot;吞掉&quot;和错误已读标记的修复效果
          </p>
          <button
            onClick={runEmergencyTest}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? '🔄 测试中...' : '🚨 开始紧急验证'}
          </button>
        </div>
        
        {selectedUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-blue-800 font-semibold mb-2">测试对象</h3>
            <p className="text-blue-700">
              {selectedUser.name} (ID: {selectedUser.id})
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                点击上方按钮开始紧急验证测试
              </div>
            )}
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 text-sm ${
                  result.type === 'success'
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : result.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : result.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    : 'bg-blue-50 border-blue-400 text-blue-800'
                }`}
              >
                <div className="font-mono text-xs text-gray-500 mb-1">
                  {result.timestamp.toLocaleTimeString()}
                </div>
                <div className="font-mono">
                  {result.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 已修复的问题:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 简化了已读状态更新逻辑，避免重新获取消息</li>
            <li>• 优化了智能合并机制，优先保证消息不丢失</li>
            <li>• 减少了新消息检查频率，从8秒改为15秒</li>
            <li>• 提高了检查阈值，避免频繁干扰</li>
            <li>• 异步处理已读状态更新，避免阻塞响应</li>
          </ul>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ 预期结果:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 消息发送后立即可见且不会被吞掉</li>
            <li>• 消息在5秒后依然存在</li>
            <li>• 已读状态正确显示（发送时为未读）</li>
            <li>• 对方能正常接收到消息</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 