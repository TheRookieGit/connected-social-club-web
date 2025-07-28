'use client'

import { useState, useEffect } from 'react'

export default function ChatDiagnosis() {
  const [user, setUser] = useState<any>(null)
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    // 获取当前用户信息
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDiagnosis = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const token = localStorage.getItem('token')
    if (!token) {
      addResult('❌ 未找到登录token')
      setIsRunning(false)
      return
    }

    addResult('🔍 开始诊断聊天系统...')

    try {
      // 1. 测试获取匹配用户
      addResult('📋 1. 测试获取匹配用户...')
      const matchesResponse = await fetch('/api/user/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json()
        addResult(`✅ 匹配用户数量: ${matchesData.matches?.length || 0}`)
        
        if (matchesData.matches && matchesData.matches.length > 0) {
          const testUser = matchesData.matches[0]
          addResult(`🎯 测试对象: ${testUser.name} (ID: ${testUser.id})`)
          
          // 2. 测试发送消息
          addResult('📤 2. 测试发送消息...')
          const testMessage = `测试消息 ${Date.now()}`
          
          const sendResponse = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              receiverId: parseInt(testUser.id),
              message: testMessage,
              messageType: 'text'
            })
          })
          
          if (sendResponse.ok) {
            const sendData = await sendResponse.json()
            addResult(`✅ 消息发送成功，ID: ${sendData.data?.id}`)
            
            // 3. 立即查询消息
            addResult('📥 3. 立即查询消息...')
            const conversationResponse = await fetch(
              `/api/messages/conversation?userId=${testUser.id}&limit=10`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            )
            
            if (conversationResponse.ok) {
              const conversationData = await conversationResponse.json()
              const messages = conversationData.messages || []
              addResult(`✅ 查询到 ${messages.length} 条消息`)
              
              // 检查刚发送的消息是否存在
              const sentMessage = messages.find((msg: any) => 
                msg.content === testMessage && msg.senderId === user?.id?.toString()
              )
              
              if (sentMessage) {
                addResult(`✅ 刚发送的消息已找到: "${sentMessage.content}"`)
              } else {
                addResult(`❌ 刚发送的消息未找到！这是问题所在`)
                addResult(`📋 最新5条消息: ${messages.slice(-5).map((m: any) => `"${m.content}"`).join(', ')}`)
              }
              
              // 4. 等待5秒后再次查询（模拟轮询）
              addResult('⏱️ 4. 等待5秒后再次查询（模拟轮询）...')
              setTimeout(async () => {
                const reCheckResponse = await fetch(
                  `/api/messages/conversation?userId=${testUser.id}&limit=10`,
                  { headers: { 'Authorization': `Bearer ${token}` } }
                )
                
                if (reCheckResponse.ok) {
                  const reCheckData = await reCheckResponse.json()
                  const newMessages = reCheckData.messages || []
                  addResult(`🔄 重新查询到 ${newMessages.length} 条消息`)
                  
                  const stillExists = newMessages.find((msg: any) => 
                    msg.content === testMessage && msg.senderId === user?.id?.toString()
                  )
                  
                  if (stillExists) {
                    addResult(`✅ 消息持久性正常：消息在5秒后仍然存在`)
                  } else {
                    addResult(`❌ 消息持久性问题：消息在5秒后消失了！`)
                  }
                } else {
                  addResult(`❌ 重新查询失败: ${reCheckResponse.status}`)
                }
                
                setIsRunning(false)
              }, 5000)
            } else {
              addResult(`❌ 查询消息失败: ${conversationResponse.status}`)
              setIsRunning(false)
            }
          } else {
            addResult(`❌ 发送消息失败: ${sendResponse.status}`)
            const errorText = await sendResponse.text()
            addResult(`错误详情: ${errorText}`)
            setIsRunning(false)
          }
        } else {
          addResult('❌ 没有匹配用户，无法测试消息功能')
          setIsRunning(false)
        }
      } else {
        addResult(`❌ 获取匹配用户失败: ${matchesResponse.status}`)
        setIsRunning(false)
      }
    } catch (error) {
      addResult(`❌ 诊断过程中出错: ${error}`)
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">聊天系统诊断工具</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900">当前用户</h2>
              <p className="text-blue-700">姓名: {user.name} | ID: {user.id}</p>
            </div>
          )}
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runDiagnosis}
              disabled={isRunning || !user}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? '诊断中...' : '开始诊断'}
            </button>
            
            <button
              onClick={clearResults}
              disabled={isRunning}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              清空结果
            </button>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg min-h-[400px] font-mono text-sm">
            <div className="mb-2 text-green-400">聊天诊断日志:</div>
            {testResults.length === 0 && (
              <div className="text-gray-500">点击"开始诊断"来测试聊天功能...</div>
            )}
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
            {isRunning && (
              <div className="text-yellow-400 animate-pulse">正在运行诊断...</div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">诊断说明</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• 测试消息发送到数据库是否成功</li>
              <li>• 测试消息查询是否能立即找到刚发送的消息</li>
              <li>• 测试消息持久性（5秒后是否还存在）</li>
              <li>• 帮助定位"对方收不到"和"刷新后消失"的问题</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 