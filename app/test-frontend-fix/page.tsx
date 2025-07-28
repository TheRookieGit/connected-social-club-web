'use client'

import { useState, useEffect } from 'react'

export default function TestFrontendFix() {
  const [user, setUser] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const testFrontendFix = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      console.log('🧪 开始测试前端消息显示修复...')
      
      // 测试1: 获取完整消息历史
      console.log('🧪 测试1: 获取完整消息历史...')
      const response1 = await fetch('/api/messages/conversation?userId=7&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response1.ok) {
        const data1 = await response1.json()
        console.log('✅ 测试1结果:', data1)
        
        // 检查是否包含ID 36的消息
        const hasMessage36 = data1.messages.some((msg: any) => msg.id === 36)
        console.log('🔍 检查是否包含ID 36消息:', hasMessage36)
        
        // 测试2: 模拟前端增量更新（使用limit=20）
        console.log('🧪 测试2: 模拟前端增量更新...')
        const response2 = await fetch('/api/messages/conversation?userId=7&limit=20', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response2.ok) {
          const data2 = await response2.json()
          console.log('✅ 测试2结果:', data2)
          
          // 检查limit=20是否包含ID 36
          const hasMessage36InLimit20 = data2.messages.some((msg: any) => msg.id === 36)
          console.log('🔍 limit=20是否包含ID 36消息:', hasMessage36InLimit20)
          
          // 测试3: 检查消息ID范围
          const messageIds = data2.messages.map((msg: any) => msg.id).sort((a: number, b: number) => a - b)
          console.log('📋 limit=20返回的消息ID范围:', {
            min: messageIds[0],
            max: messageIds[messageIds.length - 1],
            count: messageIds.length,
            allIds: messageIds
          })
          
          setTestResult({
            success: true,
            tests: {
              test1: { 
                success: true, 
                data: data1, 
                hasMessage36,
                totalMessages: data1.messages.length
              },
              test2: { 
                success: true, 
                data: data2, 
                hasMessage36InLimit20,
                totalMessages: data2.messages.length,
                messageIds
              }
            },
            analysis: {
              fullHistoryHasMessage36: hasMessage36,
              limit20HasMessage36: hasMessage36InLimit20,
              messageLossDetected: hasMessage36 && !hasMessage36InLimit20,
              frontendIssueConfirmed: hasMessage36 && !hasMessage36InLimit20
            }
          })
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🧪 前端消息显示修复测试</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900">当前用户: {user.name} (ID: {user.id})</h2>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={testFrontendFix}
              disabled={loading || !user}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? '🧪 测试中...' : '🚀 测试前端修复'}
            </button>
          </div>

          {testResult && (
            <div className="space-y-6">
              {testResult.success ? (
                <>
                  {/* 问题分析 */}
                  <div className={`p-4 rounded-lg ${testResult.analysis.frontendIssueConfirmed ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className={`font-semibold mb-3 ${testResult.analysis.frontendIssueConfirmed ? 'text-red-900' : 'text-green-900'}`}>
                      {testResult.analysis.frontendIssueConfirmed ? '🚨 前端问题已确认' : '✅ 前端问题已修复'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${testResult.analysis.fullHistoryHasMessage36 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        完整历史包含ID 36: {testResult.analysis.fullHistoryHasMessage36 ? '✅ 是' : '❌ 否'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${testResult.analysis.limit20HasMessage36 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        limit=20包含ID 36: {testResult.analysis.limit20HasMessage36 ? '✅ 是' : '❌ 否'}
                      </div>
                      <div className="flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${testResult.analysis.messageLossDetected ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        消息丢失检测: {testResult.analysis.messageLossDetected ? '🚨 检测到丢失' : '✅ 无丢失'}
                      </div>
                    </div>
                  </div>

                  {/* 详细结果 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">📋 详细测试结果</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700">测试1 - 完整消息历史 (limit=100):</h4>
                        <div className="text-sm text-gray-600">
                          返回 {testResult.tests.test1.totalMessages} 条消息
                          <br />
                          包含ID 36: {testResult.tests.test1.hasMessage36 ? '✅ 是' : '❌ 否'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">测试2 - 前端增量更新 (limit=20):</h4>
                        <div className="text-sm text-gray-600">
                          返回 {testResult.tests.test2.totalMessages} 条消息
                          <br />
                          包含ID 36: {testResult.tests.test2.hasMessage36InLimit20 ? '✅ 是' : '❌ 否'}
                          <br />
                          消息ID范围: {testResult.tests.test2.messageIds[0]} - {testResult.tests.test2.messageIds[testResult.tests.test2.messageIds.length - 1]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 修复建议 */}
                  {testResult.analysis.frontendIssueConfirmed && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-3">🔧 修复建议</h3>
                      <div className="text-yellow-700 text-sm space-y-2">
                        <p>• 前端增量更新时应该使用 limit=100 而不是 limit=20</p>
                        <p>• 确保所有API调用都获取完整的消息历史</p>
                        <p>• 检查前端消息合并逻辑是否正确</p>
                        <p>• 验证消息排序和去重逻辑</p>
                      </div>
                    </div>
                  )}
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
            <h3 className="font-semibold text-blue-900 mb-2">🎯 测试目的:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 验证完整消息历史是否包含ID 36</li>
              <li>• 检查前端增量更新是否丢失消息</li>
              <li>• 确认前端显示问题的根本原因</li>
              <li>• 验证修复是否生效</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 