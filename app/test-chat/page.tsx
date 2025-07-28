'use client'

import { useState, useEffect } from 'react'

export default function TestChat() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [matchedUsers, setMatchedUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [testMessage, setTestMessage] = useState('测试消息 - ' + new Date().toLocaleTimeString())
  const [chatHistory, setChatHistory] = useState<any[]>([])

  const addResult = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    setResults(prev => [...prev, { type, message, timestamp: new Date() }])
  }

  // 获取已匹配用户
  const getMatchedUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        addResult('error', '请先登录')
        return
      }

      addResult('info', '获取已匹配用户...')
      
      const response = await fetch('/api/user/matched-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMatchedUsers(data.matchedUsers || [])
          addResult('success', `找到 ${data.matchedUsers?.length || 0} 个已匹配用户`)
          
          if (data.matchedUsers && data.matchedUsers.length > 0) {
            data.matchedUsers.forEach((user: any) => {
              addResult('info', `- ${user.name} (ID: ${user.id})`)
            })
          }
        } else {
          addResult('error', '获取已匹配用户失败: ' + data.error)
        }
      } else {
        addResult('error', '获取已匹配用户请求失败')
      }
    } catch (error) {
      addResult('error', '获取已匹配用户异常: ' + error)
    }
  }

  // 发送测试消息
  const sendTestMessage = async () => {
    if (!selectedUser) {
      addResult('error', '请先选择聊天对象')
      return
    }

    try {
      const token = localStorage.getItem('token')
      addResult('info', `向 ${selectedUser.name} 发送消息: "${testMessage}"`)

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
          addResult('success', '✅ 消息发送成功!')
          addResult('info', `消息ID: ${data.data.id}`)
          
          // 立即获取聊天记录
          await getChatHistory()
        } else {
          addResult('error', '❌ 消息发送失败: ' + data.error)
        }
      } else {
        const errorText = await response.text()
        addResult('error', '❌ 消息发送请求失败: ' + errorText)
      }
    } catch (error) {
      addResult('error', '❌ 发送消息异常: ' + error)
    }
  }

  // 获取聊天记录
  const getChatHistory = async () => {
    if (!selectedUser) {
      addResult('error', '请先选择聊天对象')
      return
    }

    try {
      const token = localStorage.getItem('token')
      addResult('info', `获取与 ${selectedUser.name} 的聊天记录...`)

      const response = await fetch(`/api/messages/conversation?userId=${selectedUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setChatHistory(data.messages || [])
          addResult('success', `✅ 获取到 ${data.messages?.length || 0} 条聊天记录`)
          
          if (data.messages && data.messages.length > 0) {
            addResult('info', '最近的聊天记录:')
            data.messages.slice(-3).forEach((msg: any) => {
              const time = new Date(msg.timestamp).toLocaleTimeString()
              addResult('info', `  [${time}] ${msg.senderId === localStorage.getItem('user') && JSON.parse(localStorage.getItem('user') || '{}').id?.toString() === msg.senderId ? '我' : selectedUser.name}: ${msg.content}`)
            })
          }
        } else {
          addResult('error', '❌ 获取聊天记录失败: ' + data.error)
        }
      } else {
        const errorText = await response.text()
        addResult('error', '❌ 获取聊天记录请求失败: ' + errorText)
      }
    } catch (error) {
      addResult('error', '❌ 获取聊天记录异常: ' + error)
    }
  }

  // 完整测试流程
  const runFullTest = async () => {
    setLoading(true)
    setResults([])
    setChatHistory([])

    try {
      const user = localStorage.getItem('user')
      if (!user) {
        addResult('error', '请先登录')
        return
      }

      const userData = JSON.parse(user)
      addResult('info', `开始聊天功能测试 - 当前用户: ${userData.name}`)

      // 步骤1: 获取已匹配用户
      await getMatchedUsers()

      // 等待用户选择聊天对象（如果没有匹配用户，先创建）
      if (matchedUsers.length === 0) {
        addResult('info', '没有已匹配用户，尝试创建测试匹配...')
        
        // 创建测试匹配
        const token = localStorage.getItem('token')
        const testResponse = await fetch('/api/admin/test-pending-flow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'create_pending' })
        })

        if (testResponse.ok) {
          const testData = await testResponse.json()
          if (testData.success) {
            addResult('success', '✅ 创建了测试匹配，请接受后再测试聊天')
            addResult('info', '请：1. 刷新页面 2. 点击紫色按钮接受匹配 3. 返回此页面测试聊天')
          }
        }
      }
    } catch (error) {
      addResult('error', '测试过程出错: ' + error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 页面加载时获取已匹配用户
    getMatchedUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">聊天功能测试</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：测试控制面板 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">测试控制</h2>
              
              <div className="space-y-4">
                <button
                  onClick={runFullTest}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '测试中...' : '🔬 开始完整测试'}
                </button>

                <button
                  onClick={async () => {
                    if (!matchedUsers || matchedUsers.length === 0) {
                      addResult('error', '请先确保有已匹配用户')
                      await getMatchedUsers()
                      return
                    }
                    
                    setLoading(true)
                    setResults([])
                    
                    try {
                      const token = localStorage.getItem('token')
                      const testMsg = `快速测试 - ${new Date().toLocaleTimeString()}`
                      const targetUser = matchedUsers[0]
                      
                      addResult('info', `⚡ 快速验证开始 - 发送给 ${targetUser.name}`)
                      
                      // 发送消息
                      const response = await fetch('/api/messages/send', {
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
                      
                      if (response.ok) {
                        const data = await response.json()
                        if (data.success) {
                          addResult('success', `✅ 消息发送成功 - ID: ${data.data.id}`)
                          addResult('info', '🎯 现在请在聊天面板中验证消息是否显示且不会被吞掉')
                          addResult('info', '💡 建议：打开聊天面板，观察消息是否持续显示')
                        } else {
                          addResult('error', `❌ 发送失败: ${data.error}`)
                        }
                      } else {
                        addResult('error', '❌ 请求失败')
                      }
                    } catch (error) {
                      addResult('error', '❌ 异常: ' + error)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? '测试中...' : '⚡ 快速验证'}
                </button>

                <button
                  onClick={getMatchedUsers}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  📋 刷新已匹配用户
                </button>

                {matchedUsers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择聊天对象:
                    </label>
                    <select
                      value={selectedUser?.id || ''}
                      onChange={(e) => {
                        const user = matchedUsers.find(u => u.id === e.target.value)
                        setSelectedUser(user)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">请选择...</option>
                      {matchedUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} (ID: {user.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedUser && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        测试消息:
                      </label>
                      <input
                        type="text"
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="输入测试消息..."
                      />
                    </div>

                    <button
                      onClick={sendTestMessage}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      💬 发送测试消息
                    </button>

                    <button
                      onClick={getChatHistory}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      📥 获取聊天记录
                    </button>

                    <button
                      onClick={() => {
                        addResult('info', '🧪 开始消息持久性测试...')
                        // 发送消息后立即检查是否保存
                        sendTestMessage().then(() => {
                          setTimeout(() => {
                            getChatHistory()
                            addResult('info', '✅ 消息持久性测试完成，请检查聊天记录')
                          }, 2000)
                        })
                      }}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      🧪 测试消息持久性
                    </button>

                    <button
                      onClick={async () => {
                        if (!selectedUser) {
                          addResult('error', '请先选择聊天对象')
                          return
                        }
                        
                        setLoading(true)
                        addResult('info', '🚀 开始完整端到端测试...')
                        
                        try {
                          const token = localStorage.getItem('token')
                          const testMsg = `测试消息 - ${new Date().toLocaleTimeString()}`
                          
                          // 步骤1: 发送消息
                          addResult('info', `📤 步骤1: 发送测试消息 "${testMsg}"`)
                          const sendResponse = await fetch('/api/messages/send', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              receiverId: parseInt(selectedUser.id),
                              message: testMsg,
                              messageType: 'text'
                            })
                          })
                          
                          if (!sendResponse.ok) {
                            addResult('error', '❌ 步骤1失败: 发送消息失败')
                            return
                          }
                          
                          const sendData = await sendResponse.json()
                          if (!sendData.success) {
                            addResult('error', `❌ 步骤1失败: ${sendData.error}`)
                            return
                          }
                          
                          addResult('success', `✅ 步骤1成功: 消息已发送，ID: ${sendData.data.id}`)
                          
                          // 步骤2: 等待一秒确保数据库写入
                          addResult('info', '⏳ 步骤2: 等待数据库写入...')
                          await new Promise(resolve => setTimeout(resolve, 1000))
                          
                          // 步骤3: 获取聊天记录
                          addResult('info', '📥 步骤3: 获取聊天记录验证保存')
                          const getResponse = await fetch(`/api/messages/conversation?userId=${selectedUser.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          })
                          
                          if (!getResponse.ok) {
                            addResult('error', '❌ 步骤3失败: 获取聊天记录失败')
                            return
                          }
                          
                          const getData = await getResponse.json()
                          if (!getData.success) {
                            addResult('error', `❌ 步骤3失败: ${getData.error}`)
                            return
                          }
                          
                          // 步骤4: 验证消息是否在聊天记录中
                          addResult('info', `📋 步骤4: 验证消息 - 获取到 ${getData.messages.length} 条消息`)
                          const foundMessage = getData.messages.find((msg: any) => 
                            msg.content === testMsg && msg.id.toString() === sendData.data.id.toString()
                          )
                          
                          if (foundMessage) {
                            addResult('success', `🎉 测试成功! 消息已正确保存和加载`)
                            addResult('info', `✅ 验证详情: ID ${foundMessage.id}, 内容 "${foundMessage.content}"`)
                          } else {
                            addResult('error', `❌ 测试失败! 发送的消息未在聊天记录中找到`)
                            addResult('info', `🔍 查找的消息: ID ${sendData.data.id}, 内容 "${testMsg}"`)
                            addResult('info', `📋 现有消息:`)
                            getData.messages.forEach((msg: any) => {
                              addResult('info', `  - ID ${msg.id}: "${msg.content}"`)
                            })
                          }
                          
                        } catch (error) {
                          addResult('error', '❌ 端到端测试异常: ' + error)
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {loading ? '测试中...' : '🚀 完整端到端测试'}
                    </button>

                    <button
                      onClick={async () => {
                        if (!selectedUser) {
                          addResult('error', '请先选择聊天对象')
                          return
                        }
                        
                        try {
                          const token = localStorage.getItem('token')
                          addResult('info', `🔍 调试与 ${selectedUser.name} 的消息查询...`)
                          
                          const response = await fetch(`/api/debug/messages?userId=${selectedUser.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            if (data.success) {
                              addResult('success', `✅ 调试查询完成`)
                              addResult('info', `📋 用户相关消息总数: ${data.debug.totalAllMessages}`)
                              addResult('info', `💬 对话消息总数: ${data.debug.totalConversationMessages}`)
                              addResult('info', `🕒 最近消息: ${data.debug.recentMessages.length} 条`)
                              
                              // 显示最近的几条消息
                              data.debug.recentMessages.slice(0, 3).forEach((msg: any) => {
                                const time = new Date(msg.created_at).toLocaleTimeString()
                                addResult('info', `  [${time}] ID:${msg.id} ${msg.sender_id}→${msg.receiver_id}: ${msg.message}`)
                              })
                            } else {
                              addResult('error', '调试查询失败: ' + data.error)
                            }
                          } else {
                            addResult('error', '调试查询请求失败')
                          }
                        } catch (error) {
                          addResult('error', '调试查询异常: ' + error)
                        }
                      }}
                      className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      🔍 调试消息查询
                    </button>

                    <button
                      onClick={async () => {
                        if (!selectedUser) {
                          addResult('error', '请先选择聊天对象')
                          return
                        }
                        
                        setLoading(true)
                        addResult('info', '💬 开始双向通信测试...')
                        
                        try {
                          const token = localStorage.getItem('token')
                          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                          
                          // 第一步：当前用户发送消息
                          const msg1 = `来自用户${currentUser.id}的消息 - ${new Date().toLocaleTimeString()}`
                          addResult('info', `📤 当前用户(${currentUser.id})发送: "${msg1}"`)
                          
                          const sendResponse1 = await fetch('/api/messages/send', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              receiverId: parseInt(selectedUser.id),
                              message: msg1,
                              messageType: 'text'
                            })
                          })
                          
                          if (!sendResponse1.ok) {
                            addResult('error', '❌ 第一条消息发送失败')
                            return
                          }
                          
                          const sendData1 = await sendResponse1.json()
                          addResult('success', `✅ 消息1发送成功，ID: ${sendData1.data.id}`)
                          
                          // 等待2秒
                          addResult('info', '⏳ 等待2秒...')
                          await new Promise(resolve => setTimeout(resolve, 2000))
                          
                          // 验证双方都能看到消息
                          addResult('info', '🔍 验证双方都能看到消息...')
                          
                          // 从当前用户角度查看
                          const getResponse1 = await fetch(`/api/messages/conversation?userId=${selectedUser.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          })
                          
                          if (getResponse1.ok) {
                            const getData1 = await getResponse1.json()
                            if (getData1.success) {
                              const found1 = getData1.messages.find((msg: any) => msg.id.toString() === sendData1.data.id.toString())
                              if (found1) {
                                addResult('success', `✅ 当前用户能看到自己发送的消息`)
                              } else {
                                addResult('error', `❌ 当前用户看不到自己发送的消息`)
                              }
                              
                              addResult('info', `📊 当前用户视角: 总共${getData1.messages.length}条消息`)
                              getData1.messages.slice(-3).forEach((msg: any) => {
                                addResult('info', `  - [${msg.senderId}→${msg.receiverId}] ${msg.content}`)
                              })
                            }
                          }
                          
                          addResult('success', '🎉 双向通信测试完成！')
                          addResult('info', '💡 提示：现在请打开另一个浏览器窗口或标签页，登录对方账户，查看是否能收到消息')
                          
                        } catch (error) {
                          addResult('error', '❌ 双向通信测试异常: ' + error)
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? '测试中...' : '💬 双向通信测试'}
                    </button>
                     <button
                       onClick={async () => {
                         if (!selectedUser) {
                           addResult('error', '请先选择聊天对象')
                           return
                         }
                         
                         try {
                           const token = localStorage.getItem('token')
                           const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                           
                           addResult('info', `📖 测试已读状态功能...`)
                           
                           // 第一步：发送测试消息
                           const testMsg = `已读测试 - ${new Date().toLocaleTimeString()}`
                           addResult('info', `📤 发送测试消息: "${testMsg}"`)
                           
                           const sendResponse = await fetch('/api/messages/send', {
                             method: 'POST',
                             headers: {
                               'Content-Type': 'application/json',
                               'Authorization': `Bearer ${token}`
                             },
                             body: JSON.stringify({
                               receiverId: parseInt(selectedUser.id),
                               message: testMsg,
                               messageType: 'text'
                             })
                           })
                           
                           if (!sendResponse.ok) {
                             addResult('error', '❌ 发送失败')
                             return
                           }
                           
                           const sendData = await sendResponse.json()
                           if (!sendData.success) {
                             addResult('error', `❌ 发送失败: ${sendData.error}`)
                             return
                           }
                           
                           addResult('success', `✅ 消息发送成功 - ID: ${sendData.data.id}`)
                           
                           // 第二步：检查消息初始状态（应该是未读）
                           addResult('info', '📥 检查消息初始状态...')
                           await new Promise(resolve => setTimeout(resolve, 1000))
                           
                           const getResponse1 = await fetch(`/api/messages/conversation?userId=${selectedUser.id}`, {
                             headers: { 'Authorization': `Bearer ${token}` }
                           })
                           
                           if (getResponse1.ok) {
                             const getData1 = await getResponse1.json()
                             if (getData1.success) {
                               const sentMessage = getData1.messages.find((msg: any) => 
                                 msg.id.toString() === sendData.data.id.toString()
                               )
                               
                               if (sentMessage) {
                                 if (sentMessage.isRead) {
                                   addResult('warning', `⚠️ 消息显示为已读（预期应为未读）`)
                                 } else {
                                   addResult('success', `✅ 消息正确显示为未读`)
                                 }
                                 addResult('info', `📊 消息详情: 发送者${sentMessage.senderId} → 接收者${sentMessage.receiverId}, 已读: ${sentMessage.isRead}`)
                               } else {
                                 addResult('error', `❌ 未找到发送的消息`)
                               }
                             }
                           }
                           
                           addResult('info', '💡 测试提示：')
                           addResult('info', '1. 现在请在聊天面板中查看消息状态（应显示单个✓）')
                           addResult('info', '2. 用另一个账户登录查看消息（模拟对方阅读）')
                           addResult('info', '3. 再次检查消息状态（应变为双✓已读状态）')
                           
                         } catch (error) {
                           addResult('error', '❌ 已读状态测试异常: ' + error)
                         }
                       }}
                       className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                     >
                       📖 测试已读状态
                     </button>
                  </div>
                )}
              </div>
            </div>

            {/* 聊天记录预览 */}
            {chatHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">聊天记录预览</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {chatHistory.map((msg, index) => {
                    const isMe = msg.senderId === JSON.parse(localStorage.getItem('user') || '{}').id?.toString()
                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg ${
                          isMe 
                            ? 'bg-blue-100 text-blue-900 ml-8' 
                            : 'bg-gray-100 text-gray-900 mr-8'
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          {isMe ? '我' : selectedUser?.name} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm">{msg.content}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：测试结果 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">测试结果</h3>
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
                  <pre className="whitespace-pre-wrap font-mono">
                    {result.message}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 测试说明：</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. 确保已登录并有已匹配的用户</li>
            <li>2. 如果没有匹配用户，会自动创建测试匹配</li>
            <li>3. 选择聊天对象后发送测试消息</li>
            <li>4. 查看聊天记录验证消息是否保存</li>
            <li>5. 刷新页面再次获取记录，验证持久性</li>
          </ol>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📖 已读状态功能：</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>单个✓</strong>：消息已发送但未读</li>
            <li>• <strong>双✓</strong>：消息已读（蓝色显示）</li>
            <li>• 只有发送者能看到已读状态标识</li>
            <li>• 对方查看消息时自动标记为已读</li>
            <li>• 支持实时更新，无需手动刷新</li>
          </ul>
        </div>

        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">🔍 调试提示：</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• 打开浏览器开发者工具查看详细的API日志</li>
            <li>• 如果消息发送失败，检查控制台错误信息</li>
            <li>• 如果聊天记录为空，可能是匹配关系或权限问题</li>
            <li>• 已读状态更新可能有8秒延迟（自动同步间隔）</li>
            <li>• 可以点击聊天面板的🔄按钮立即同步已读状态</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 