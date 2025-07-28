'use client'

import { useState, useEffect } from 'react'

export default function TestFix() {
  const [user, setUser] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const testChatFix = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      // 测试1: 获取聊天记录
      console.log('🧪 测试1: 获取聊天记录...')
      const response1 = await fetch('/api/messages/conversation?userId=7&limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response1.ok) {
        const data1 = await response1.json()
        console.log('✅ 测试1结果:', data1)
        
        // 测试2: 发送消息
        console.log('🧪 测试2: 发送消息...')
        const testMessage = `测试消息 - ${new Date().toLocaleTimeString()}`
        const response2 = await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: 7,
            message: testMessage
          })
        })

        if (response2.ok) {
          const data2 = await response2.json()
          console.log('✅ 测试2结果:', data2)
          
          // 测试3: 再次获取聊天记录
          console.log('🧪 测试3: 再次获取聊天记录...')
          setTimeout(async () => {
            const response3 = await fetch('/api/messages/conversation?userId=7&limit=20', {
              headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response3.ok) {
              const data3 = await response3.json()
              console.log('✅ 测试3结果:', data3)
              
              // 检查消息是否包含新发送的消息
              const newMessageFound = data3.messages.some((msg: any) => 
                msg.content === testMessage
              )
              
              setTestResult({
                success: true,
                tests: {
                  test1: { success: true, data: data1 },
                  test2: { success: true, data: data2 },
                  test3: { success: true, data: data3, newMessageFound }
                },
                summary: {
                  initialMessageCount: data1.messages.length,
                  finalMessageCount: data3.messages.length,
                  messageSent: data2.success,
                  messagePersisted: newMessageFound,
                  consistencyCheck: data3.debug?.consistent
                }
              })
            } else {
              setTestResult({
                success: false,
                error: '测试3失败: ' + response3.status
              })
            }
          }, 1000) // 等待1秒
        } else {
          setTestResult({
            success: false,
            error: '测试2失败: ' + response2.status
          })
        }
      } else {
        setTestResult({
          success: false,
          error: '测试1失败: ' + response1.status
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: '测试错误: ' + error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🧪 聊天修复测试</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900">当前用户: {user.name} (ID: {user.id})</h2>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={testChatFix}
              disabled={loading || !user}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '🧪 测试中...' : '🚀 开始测试聊天修复'}
            </button>
          </div>

          {testResult && (
            <div className="space-y-6">
              {testResult.success ? (
                <>
                  {/* 测试摘要 */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-3">📊 测试摘要</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{testResult.summary.initialMessageCount}</div>
                        <div className="text-sm text-gray-600">初始消息数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{testResult.summary.finalMessageCount}</div>
                        <div className="text-sm text-gray-600">最终消息数</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${testResult.summary.messageSent ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        消息发送: {testResult.summary.messageSent ? '✅ 成功' : '❌ 失败'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${testResult.summary.messagePersisted ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        消息持久化: {testResult.summary.messagePersisted ? '✅ 成功' : '❌ 失败'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${testResult.summary.consistencyCheck ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        数据一致性: {testResult.summary.consistencyCheck ? '✅ 通过' : '❌ 失败'}
                      </div>
                    </div>
                  </div>

                  {/* 详细结果 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">📋 详细结果</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700">测试1 - 获取聊天记录:</h4>
                        <div className="text-sm text-gray-600">
                          返回 {testResult.tests.test1.data.messages.length} 条消息
                          {testResult.tests.test1.data.debug && (
                            <span className="ml-2">
                              (一致性: {testResult.tests.test1.data.debug.consistent ? '✅' : '❌'})
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">测试2 - 发送消息:</h4>
                        <div className="text-sm text-gray-600">
                          {testResult.tests.test2.data.success ? '✅ 发送成功' : '❌ 发送失败'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">测试3 - 验证持久化:</h4>
                        <div className="text-sm text-gray-600">
                          返回 {testResult.tests.test3.data.messages.length} 条消息
                          {testResult.tests.test3.data.debug && (
                            <span className="ml-2">
                              (一致性: {testResult.tests.test3.data.debug.consistent ? '✅' : '❌'})
                            </span>
                          )}
                          <br />
                          新消息查找: {testResult.tests.test3.newMessageFound ? '✅ 找到' : '❌ 未找到'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">❌ 测试失败</h3>
                  <p className="text-red-700">{testResult.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 测试内容:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 获取当前聊天记录</li>
              <li>• 发送测试消息</li>
              <li>• 验证消息是否持久化</li>
              <li>• 检查数据一致性</li>
              <li>• 确认刷新后消息不会消失</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 