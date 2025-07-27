'use client'

import { useState } from 'react'

export default function TestMatch() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runTest = async () => {
    setLoading(true)
    setResults([])
    const steps: any[] = []

    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        steps.push({ type: 'error', message: '请先登录' })
        setResults(steps)
        return
      }

      const userData = JSON.parse(user)
      steps.push({ type: 'info', message: `开始测试 - 当前用户: ${userData.name} (ID: ${userData.id})` })

      // 步骤1: 创建pending匹配
      steps.push({ type: 'info', message: '步骤1: 创建pending匹配...' })
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
          steps.push({ type: 'success', message: '✅ 成功创建pending匹配' })
          steps.push({ type: 'info', message: testData.message })
        } else {
          steps.push({ type: 'error', message: '❌ 创建pending匹配失败: ' + testData.error })
        }
      }
      setResults([...steps])

      // 步骤2: 检查pending匹配
      steps.push({ type: 'info', message: '步骤2: 检查pending匹配...' })
      const pendingResponse = await fetch('/api/user/pending-matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        if (pendingData.success) {
          steps.push({ type: 'success', message: `✅ 找到 ${pendingData.total} 个pending匹配` })
          if (pendingData.pendingMatches.length > 0) {
            steps.push({ type: 'info', message: `Pending用户: ${pendingData.pendingMatches.map((u: any) => u.name).join(', ')}` })

            // 步骤3: 接受第一个pending匹配
            const firstPending = pendingData.pendingMatches[0]
            steps.push({ type: 'info', message: `步骤3: 接受来自 ${firstPending.name} 的匹配...` })
            
            const acceptResponse = await fetch('/api/user/pending-matches', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                senderUserId: parseInt(firstPending.id),
                action: 'accept'
              })
            })

            if (acceptResponse.ok) {
              const acceptData = await acceptResponse.json()
              if (acceptData.success) {
                steps.push({ type: 'success', message: '✅ 成功接受匹配' })
                steps.push({ type: 'info', message: acceptData.message })
              } else {
                steps.push({ type: 'error', message: '❌ 接受匹配失败: ' + acceptData.error })
              }
            }
            setResults([...steps])

            // 步骤4: 检查已匹配用户
            steps.push({ type: 'info', message: '步骤4: 检查已匹配用户列表...' })
            const matchedResponse = await fetch('/api/user/matched-users', {
              headers: { 'Authorization': `Bearer ${token}` }
            })

            if (matchedResponse.ok) {
              const matchedData = await matchedResponse.json()
              if (matchedData.success) {
                steps.push({ type: 'success', message: `✅ 找到 ${matchedData.total} 个已匹配用户` })
                if (matchedData.matchedUsers.length > 0) {
                  steps.push({ type: 'success', message: `已匹配用户: ${matchedData.matchedUsers.map((u: any) => u.name).join(', ')}` })
                  steps.push({ type: 'success', message: '🎉 测试成功！匹配功能正常工作' })
                } else {
                  steps.push({ type: 'error', message: '❌ 接受匹配后，已匹配列表仍为空' })
                }
              } else {
                steps.push({ type: 'error', message: '❌ 获取已匹配用户失败: ' + matchedData.error })
              }
            }
          }
        } else {
          steps.push({ type: 'error', message: '❌ 获取pending匹配失败: ' + pendingData.error })
        }
      }

    } catch (error) {
      steps.push({ type: 'error', message: '❌ 测试过程中发生错误: ' + error })
    } finally {
      setLoading(false)
      setResults(steps)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">匹配功能测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">自动化测试</h2>
          <p className="text-gray-600 mb-6">
            这个测试会自动：
            <br />1. 创建一个pending匹配
            <br />2. 接受这个匹配
            <br />3. 验证已匹配用户列表是否正确更新
          </p>
          
          <button
            onClick={runTest}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? '测试中...' : '开始自动化测试'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">测试结果</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.type === 'success'
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : result.type === 'error'
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'bg-blue-50 border-blue-400 text-blue-800'
                  }`}
                >
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {result.message}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 测试说明：</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 确保已登录系统</li>
            <li>• 测试会模拟完整的匹配流程</li>
            <li>• 如果测试成功，说明匹配功能工作正常</li>
            <li>• 如果测试失败，请检查控制台错误信息</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 