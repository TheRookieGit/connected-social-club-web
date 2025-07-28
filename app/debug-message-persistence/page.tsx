'use client'

import { useState, useEffect } from 'react'

export default function DebugMessagePersistence() {
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [targetUserId, setTargetUserId] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️' }
    setLogs(prev => [...prev, `${timestamp}: ${icons[type]} ${message}`])
  }

  const directDatabaseTest = async () => {
    if (!testMessage.trim() || !targetUserId.trim()) {
      alert('请输入测试消息和目标用户ID')
      return
    }

    setIsRunning(true)
    setLogs([])

    const token = localStorage.getItem('token')
    if (!token) {
      addLog('未找到登录token', 'error')
      setIsRunning(false)
      return
    }

    addLog('🚀 开始深度消息持久化测试...')
    
    try {
      // 步骤1: 检查当前数据库中的最新消息
      addLog('1️⃣ 查询发送前的最新消息ID和数量...')
      
      const beforeResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      let beforeLatestId = null
      let beforeCount = 0
      
      if (beforeResponse.ok) {
        const beforeData = await beforeResponse.json()
        beforeCount = beforeData.total || 0
        const latestMessage = beforeData.messages?.[beforeData.messages.length - 1]
        beforeLatestId = latestMessage?.id
        
        addLog(`发送前总消息数: ${beforeCount}`)
        addLog(`发送前最新消息ID: ${beforeLatestId}`)
        addLog(`发送前最新消息内容: "${latestMessage?.content || 'N/A'}"`)
      } else {
        addLog(`发送前查询失败: ${beforeResponse.status}`, 'error')
      }

      // 步骤2: 发送消息并记录详细响应
      addLog('2️⃣ 发送测试消息...')
      const uniqueMessage = `${testMessage} [${Date.now()}]`
      addLog(`消息内容: "${uniqueMessage}"`)
      
      const sendResponse = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: parseInt(targetUserId),
          message: uniqueMessage,
          messageType: 'text'
        })
      })

      addLog(`发送API响应状态: ${sendResponse.status}`)
      
      if (!sendResponse.ok) {
        const errorText = await sendResponse.text()
        addLog(`发送失败: ${errorText}`, 'error')
        setIsRunning(false)
        return
      }
      
      const sendData = await sendResponse.json()
      addLog(`发送响应: ${JSON.stringify(sendData)}`, 'success')
      
      if (!sendData.success) {
        addLog(`发送失败: ${sendData.error}`, 'error')
        setIsRunning(false)
        return
      }
      
      const newMessageId = sendData.data?.id
      addLog(`新消息ID: ${newMessageId}`, 'success')

      // 步骤3: 立即查询验证消息是否被保存
      addLog('3️⃣ 立即查询验证消息是否保存...')
      
      // 等待一下确保数据库操作完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const verifyResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        const afterCount = verifyData.total || 0
        const afterMessages = verifyData.messages || []
        
        addLog(`发送后总消息数: ${afterCount}`)
        addLog(`消息数量变化: ${afterCount - beforeCount}`)
        
        // 查找新发送的消息
        const foundMessage = afterMessages.find((msg: any) => 
          msg.id.toString() === newMessageId?.toString()
        )
        
        if (foundMessage) {
          addLog(`✅ 新消息已找到: "${foundMessage.content}"`, 'success')
        } else {
          addLog(`❌ 新消息未找到！`, 'error')
          addLog(`查找的消息ID: ${newMessageId}`)
          addLog(`当前最新5条消息:`)
          afterMessages.slice(-5).forEach((msg: any, index: number) => {
            addLog(`  ${index + 1}. ID:${msg.id} - "${msg.content}"`)
          })
        }
        
        // 检查最新消息ID是否变化
        const currentLatestMessage = afterMessages[afterMessages.length - 1]
        const currentLatestId = currentLatestMessage?.id
        
        if (currentLatestId !== beforeLatestId) {
          addLog(`最新消息ID已更新: ${beforeLatestId} → ${currentLatestId}`, 'success')
        } else {
          addLog(`最新消息ID未变化: ${currentLatestId}`, 'warning')
        }
        
      } else {
        addLog(`验证查询失败: ${verifyResponse.status}`, 'error')
      }

      // 步骤4: 等待5秒后再次查询（模拟刷新）
      addLog('4️⃣ 等待5秒后模拟页面刷新查询...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const refreshResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        const refreshMessages = refreshData.messages || []
        
        addLog(`刷新后消息总数: ${refreshData.total}`)
        
        // 再次查找新消息
        const stillExists = refreshMessages.find((msg: any) => 
          msg.id.toString() === newMessageId?.toString()
        )
        
        if (stillExists) {
          addLog(`✅ 消息持久性测试通过: 刷新后消息仍存在`, 'success')
        } else {
          addLog(`❌ 消息持久性测试失败: 刷新后消息消失`, 'error')
          addLog(`刷新后最新5条消息:`)
          refreshMessages.slice(-5).forEach((msg: any, index: number) => {
            addLog(`  ${index + 1}. ID:${msg.id} - "${msg.content}"`)
          })
        }
      } else {
        addLog(`刷新查询失败: ${refreshResponse.status}`, 'error')
      }

      // 步骤5: 直接查询数据库检查消息是否真的存在
      addLog('5️⃣ 执行完整性检查...')
      
      const fullCheckResponse = await fetch(`/api/messages/conversation?userId=${targetUserId}&limit=100&offset=0`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (fullCheckResponse.ok) {
        const fullData = await fullCheckResponse.json()
        const allMessages = fullData.messages || []
        
        addLog(`完整性检查 - 总消息数: ${fullData.total}`)
        addLog(`完整性检查 - 返回消息数: ${allMessages.length}`)
        
        const messageExists = allMessages.find((msg: any) => 
          msg.id.toString() === newMessageId?.toString()
        )
        
        if (messageExists) {
          addLog(`✅ 完整性检查通过: 消息在数据库中`, 'success')
        } else {
          addLog(`❌ 完整性检查失败: 消息不在数据库中`, 'error')
        }
        
        // 显示最新和最旧的消息
        if (allMessages.length > 0) {
          const oldest = allMessages[0]
          const newest = allMessages[allMessages.length - 1]
          addLog(`最旧消息: ID:${oldest.id} - "${oldest.content}"`)
          addLog(`最新消息: ID:${newest.id} - "${newest.content}"`)
        }
      }

    } catch (error) {
      addLog(`测试过程中发生错误: ${error}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">消息持久化深度调试</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900">当前用户</h2>
              <p className="text-blue-700">姓名: {user.name} | ID: {user.id}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">测试参数</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标用户ID
                </label>
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="输入目标用户ID (如: 6 或 7)"
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
                  placeholder="输入测试消息"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={directDatabaseTest}
                disabled={isRunning || !user}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '🔍 深度测试中...' : '🚀 开始深度测试'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">测试说明</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 1️⃣ 检查发送前的消息状态</p>
                <p>• 2️⃣ 发送消息并记录详细响应</p>
                <p>• 3️⃣ 立即验证消息是否保存</p>
                <p>• 4️⃣ 等待5秒后模拟页面刷新</p>
                <p>• 5️⃣ 执行完整性检查</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg min-h-[500px] font-mono text-sm overflow-y-auto">
            <div className="mb-2 text-green-400 font-bold">🔍 深度调试日志:</div>
            {logs.length === 0 && (
              <div className="text-gray-500">点击&quot;开始深度测试&quot;来诊断消息持久化问题...</div>
            )}
            {logs.map((log, index) => (
              <div key={index} className="mb-1 leading-relaxed">
                {log}
              </div>
            ))}
            {isRunning && (
              <div className="text-yellow-400 animate-pulse mt-4">🔄 正在执行深度测试...</div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🎯 此工具将检查:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• 消息是否真正保存到数据库</li>
              <li>• 发送后能否立即查询到</li>
              <li>• 消息ID是否正确分配</li>
              <li>• 刷新后消息是否仍然存在</li>
              <li>• 完整的消息数量和排序</li>
              <li>• 查询API的返回数据完整性</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 