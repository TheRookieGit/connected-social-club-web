'use client'

import { useState, useEffect } from 'react'

export default function DebugChatIssue() {
  const [user, setUser] = useState<any>(null)
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [targetUserId, setTargetUserId] = useState('')
  const [beforeSendMessages, setBeforeSendMessages] = useState<any[]>([])
  const [afterSendMessages, setAfterSendMessages] = useState<any[]>([])
  const [afterRefreshMessages, setAfterRefreshMessages] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const addResult = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = isError ? '❌' : '📝'
    setTestResults(prev => [...prev, `${timestamp}: ${emoji} ${message}`])
  }

  const runDetailedTest = async () => {
    if (!testMessage.trim() || !targetUserId.trim()) {
      alert('请输入测试消息和目标用户ID')
      return
    }

    setIsRunning(true)
    setTestResults([])
    setBeforeSendMessages([])
    setAfterSendMessages([])
    setAfterRefreshMessages([])

    const token = localStorage.getItem('token')
    if (!token) {
      addResult('未找到登录token', true)
      setIsRunning(false)
      return
    }

    addResult('🔍 开始详细的消息发送测试...')

    try {
      // 步骤1: 发送前查询现有消息
      addResult('📋 步骤1: 查询发送前的消息列表...')
      const beforeResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      let beforeData: any = { messages: [] }
      if (beforeResponse.ok) {
        beforeData = await beforeResponse.json()
        setBeforeSendMessages(beforeData.messages || [])
        addResult(`📊 发送前消息数量: ${beforeData.messages?.length || 0}`)
        addResult(`📊 服务器返回的总数: ${beforeData.total || 0}`)
      } else {
        addResult(`查询发送前消息失败: ${beforeResponse.status}`, true)
      }

      // 步骤2: 发送消息
      addResult('📤 步骤2: 发送测试消息...')
      addResult(`📝 消息内容: "${testMessage}"`)
      addResult(`👤 目标用户: ${targetUserId}`)

      const sendResponse = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(targetUserId),
          message: testMessage,
          messageType: 'text'
        })
      })

      addResult(`📡 发送API状态码: ${sendResponse.status}`)

      if (sendResponse.ok) {
        const sendData = await sendResponse.json()
        addResult(`✅ 发送成功! 消息ID: ${sendData.data?.id}`)
        addResult(`📄 服务器返回: ${JSON.stringify(sendData.data)}`)

        // 步骤3: 立即查询（模拟发送后的状态）
        addResult('📥 步骤3: 发送后立即查询消息...')
        await new Promise(resolve => setTimeout(resolve, 500)) // 等待500ms

        const afterResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        let afterData: any = { messages: [] }
        if (afterResponse.ok) {
          afterData = await afterResponse.json()
          setAfterSendMessages(afterData.messages || [])
          addResult(`📊 发送后消息数量: ${afterData.messages?.length || 0}`)
          addResult(`📊 消息数量变化: ${(afterData.messages?.length || 0) - (beforeData.messages?.length || 0)}`)
          
          // 检查新消息是否在列表中
          const newMessage = afterData.messages?.find((msg: any) => 
            msg.id.toString() === sendData.data?.id?.toString()
          )
          
          if (newMessage) {
            addResult(`✅ 新消息已找到: "${newMessage.content}"`)
          } else {
            addResult(`❌ 新消息未找到！这是关键问题`, true)
            addResult(`📋 最新5条消息ID: ${afterData.messages?.slice(-5).map((m: any) => m.id).join(', ')}`)
            addResult(`🔍 查找的消息ID: ${sendData.data?.id}`)
          }
        } else {
          addResult(`发送后查询失败: ${afterResponse.status}`, true)
        }

        // 步骤4: 模拟页面刷新（重新查询）
        addResult('🔄 步骤4: 模拟页面刷新，重新查询...')
        await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒

        const refreshResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setAfterRefreshMessages(refreshData.messages || [])
          addResult(`📊 刷新后消息数量: ${refreshData.messages?.length || 0}`)
          
          // 检查消息是否还在
          const persistentMessage = refreshData.messages?.find((msg: any) => 
            msg.id.toString() === sendData.data?.id?.toString()
          )
          
          if (persistentMessage) {
            addResult(`✅ 消息持久性正常: 刷新后消息仍然存在`)
          } else {
            addResult(`❌ 消息持久性问题: 刷新后消息消失了！`, true)
            addResult(`📋 刷新后最新5条消息ID: ${refreshData.messages?.slice(-5).map((m: any) => m.id).join(', ')}`)
          }

          // 对比三个阶段的消息列表
          addResult('📊 === 消息数量统计 ===')
          addResult(`发送前: ${beforeData.messages?.length || 0} 条`)
          addResult(`发送后: ${afterData.messages?.length || 0} 条`)
          addResult(`刷新后: ${refreshData.messages?.length || 0} 条`)

        } else {
          addResult(`刷新后查询失败: ${refreshResponse.status}`, true)
        }

      } else {
        const errorText = await sendResponse.text()
        addResult(`发送消息失败: ${errorText}`, true)
      }

    } catch (error) {
      addResult(`测试过程中出错: ${error}`, true)
    } finally {
      setIsRunning(false)
    }
  }

  const quickSend = async () => {
    if (!testMessage.trim() || !targetUserId.trim()) {
      alert('请输入测试消息和目标用户ID')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('未找到登录token')
      return
    }

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(targetUserId),
          message: testMessage,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`发送成功! 消息ID: ${data.data?.id}`)
        setTestMessage('')
      } else {
        const errorText = await response.text()
        alert(`发送失败: ${errorText}`)
      }
    } catch (error) {
      alert(`发送出错: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">聊天问题深度调试工具</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900">当前用户</h2>
              <p className="text-blue-700">姓名: {user.name} | ID: {user.id}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 控制面板 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">测试控制</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标用户ID
                </label>
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="输入要发送消息的用户ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  测试消息
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="输入要发送的测试消息"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={runDetailedTest}
                  disabled={isRunning || !user}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? '测试中...' : '详细测试'}
                </button>
                
                <button
                  onClick={quickSend}
                  disabled={isRunning || !user}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  快速发送
                </button>
              </div>
            </div>

            {/* 状态显示 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">消息状态对比</h3>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-100 p-2 rounded">
                  <div className="font-medium">发送前</div>
                  <div className="text-lg">{beforeSendMessages.length}</div>
                </div>
                <div className="bg-blue-100 p-2 rounded">
                  <div className="font-medium">发送后</div>
                  <div className="text-lg">{afterSendMessages.length}</div>
                </div>
                <div className="bg-green-100 p-2 rounded">
                  <div className="font-medium">刷新后</div>
                  <div className="text-lg">{afterRefreshMessages.length}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg min-h-[400px] font-mono text-sm">
            <div className="mb-2 text-green-400">测试日志:</div>
            {testResults.length === 0 && (
              <div className="text-gray-500">设置目标用户ID和测试消息，然后点击"详细测试"...</div>
            )}
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
            {isRunning && (
              <div className="text-yellow-400 animate-pulse">正在运行测试...</div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">重点检查项目</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• 消息发送后是否立即能查询到</li>
              <li>• 消息ID是否正确返回和匹配</li>
              <li>• 刷新后消息是否仍然存在</li>
              <li>• 消息数量变化是否正确</li>
              <li>• API响应是否正常</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 