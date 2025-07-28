'use client'

import { useState, useEffect } from 'react'

export default function ChatDiagnosis() {
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [matchedUsers, setMatchedUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const addResult = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    setResults(prev => [...prev, { type, message, timestamp: new Date() }])
  }

  const steps = [
    { title: '🔍 检查登录状态', action: checkLogin },
    { title: '👥 获取匹配用户', action: getMatches },
    { title: '📤 发送测试消息', action: sendTestMessage },
    { title: '📥 验证消息接收', action: verifyReceive },
    { title: '🔄 测试实时同步', action: testRealtime },
    { title: '✅ 生成诊断报告', action: generateReport }
  ]

  async function checkLogin() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      addResult('error', '❌ 用户未登录')
      return false
    }
    
    const userData = JSON.parse(user)
    addResult('success', `✅ 用户已登录: ${userData.name} (ID: ${userData.id})`)
    return true
  }

  async function getMatches() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/matched-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.matchedUsers.length > 0) {
          setMatchedUsers(data.matchedUsers)
          setSelectedUser(data.matchedUsers[0])
          addResult('success', `✅ 找到 ${data.matchedUsers.length} 个匹配用户`)
          data.matchedUsers.forEach((user: any) => {
            addResult('info', `  - ${user.name} (ID: ${user.id})`)
          })
          return true
        } else {
          addResult('error', '❌ 没有找到匹配用户')
          return false
        }
      } else {
        addResult('error', '❌ 获取匹配用户失败')
        return false
      }
    } catch (error) {
      addResult('error', '❌ 获取匹配用户异常: ' + error)
      return false
    }
  }

  async function sendTestMessage() {
    if (!selectedUser) {
      addResult('error', '❌ 没有选择的用户')
      return false
    }

    try {
      const token = localStorage.getItem('token')
      const testMessage = `诊断测试 - ${new Date().toLocaleTimeString()}`
      
      addResult('info', `📤 向 ${selectedUser.name} 发送: "${testMessage}"`)

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
          addResult('success', `✅ 消息发送成功 - ID: ${data.data.id}`)
          selectedUser.lastMessageId = data.data.id
          selectedUser.lastMessage = testMessage
          return true
        } else {
          addResult('error', `❌ 发送失败: ${data.error}`)
          return false
        }
      } else {
        addResult('error', '❌ 发送请求失败')
        return false
      }
    } catch (error) {
      addResult('error', '❌ 发送异常: ' + error)
      return false
    }
  }

  async function verifyReceive() {
    if (!selectedUser?.lastMessageId) {
      addResult('error', '❌ 没有要验证的消息')
      return false
    }

    try {
      const token = localStorage.getItem('token')
      
      addResult('info', '📥 验证消息是否已保存...')

      const response = await fetch(`/api/messages/conversation?userId=${selectedUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const foundMessage = data.messages.find((msg: any) => 
            msg.id.toString() === selectedUser.lastMessageId.toString()
          )

          if (foundMessage) {
            addResult('success', `✅ 消息已正确保存`)
            addResult('info', `📊 对话总消息数: ${data.messages.length}`)
            return true
          } else {
            addResult('error', `❌ 消息未找到`)
            addResult('warning', `查找ID: ${selectedUser.lastMessageId}`)
            addResult('info', `现有消息: ${data.messages.map((m: any) => m.id).join(', ')}`)
            return false
          }
        } else {
          addResult('error', `❌ 获取对话失败: ${data.error}`)
          return false
        }
      } else {
        addResult('error', '❌ 获取对话请求失败')
        return false
      }
    } catch (error) {
      addResult('error', '❌ 验证异常: ' + error)
      return false
    }
  }

  async function testRealtime() {
    addResult('info', '🔄 测试实时同步机制...')
    
    // 等待12秒，模拟实时检查间隔
    addResult('info', '⏳ 等待12秒测试自动同步...')
    await new Promise(resolve => setTimeout(resolve, 12000))
    
    // 再次验证消息
    const result = await verifyReceive()
    if (result) {
      addResult('success', '✅ 实时同步机制正常')
    } else {
      addResult('warning', '⚠️ 实时同步可能有问题')
    }
    
    return true
  }

  async function generateReport() {
    const successCount = results.filter(r => r.type === 'success').length
    const errorCount = results.filter(r => r.type === 'error').length
    const warningCount = results.filter(r => r.type === 'warning').length
    
    addResult('info', '📋 诊断报告生成中...')
    
    if (errorCount === 0) {
      addResult('success', '🎉 聊天功能完全正常！')
    } else if (errorCount <= 2) {
      addResult('warning', '⚠️ 聊天功能基本正常，有轻微问题')
    } else {
      addResult('error', '❌ 聊天功能存在严重问题')
    }
    
    addResult('info', `📊 测试结果: ✅${successCount} ❌${errorCount} ⚠️${warningCount}`)
    
    return true
  }

  const runDiagnosis = async () => {
    setLoading(true)
    setResults([])
    setStep(0)
    
    for (let i = 0; i < steps.length; i++) {
      setStep(i)
      addResult('info', `🔍 步骤 ${i + 1}: ${steps[i].title}`)
      
      const success = await steps[i].action()
      
      if (!success && i < 3) {
        addResult('error', '❌ 关键步骤失败，诊断中止')
        break
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setLoading(false)
    setStep(-1)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">聊天功能诊断工具</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">诊断步骤</h2>
          <div className="space-y-2">
            {steps.map((stepInfo, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  step === index 
                    ? 'bg-blue-100 text-blue-800'
                    : step > index
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === index 
                    ? 'bg-blue-500 text-white'
                    : step > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span>{stepInfo.title}</span>
                {loading && step === index && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">诊断控制</h2>
            <button
              onClick={runDiagnosis}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '诊断中...' : '🔍 开始全面诊断'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>此工具将自动检测聊天功能的各个方面：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>用户登录状态和权限</li>
              <li>匹配用户数据获取</li>
              <li>消息发送功能</li>
              <li>消息保存和加载</li>
              <li>实时同步机制</li>
              <li>整体功能评估</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">诊断日志</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
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
      </div>
    </div>
  )
} 