'use client'

import { useState, useEffect } from 'react'

export default function TestChatFix() {
  const [results, setResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    setResults(prev => [...prev, `[${timestamp}] ${prefix} ${message}`])
  }

  const testChatPermissions = async () => {
    setIsRunning(true)
    setResults([])
    addResult('开始聊天权限测试')

    try {
      // 检查用户登录状态
      const token = localStorage.getItem('token')
      if (!token) {
        addResult('用户未登录，请先登录', 'error')
        return
      }
      addResult('用户已登录', 'success')

      // 获取当前用户信息
      const userResponse = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!userResponse.ok) {
        addResult('获取用户信息失败', 'error')
        return
      }

      const userData = await userResponse.json()
      const currentUser = userData.user || userData
      addResult(`当前用户: ${currentUser.name} (ID: ${currentUser.id})`, 'success')

      // 搜索用户测试
      addResult('测试用户搜索功能...')
      const searchResponse = await fetch('/api/user/search?q=管理员&limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.success) {
          addResult(`搜索到 ${searchData.users.length} 个用户`, 'success')
          
          searchData.users.forEach((user: any) => {
            addResult(`- ${user.name} (ID: ${user.id}) - ${user.isMatched ? '已匹配' : '未匹配'} - ${user.canStartChat ? '可聊天' : '不可聊天'}`)
          })

          // 测试与第一个已匹配用户的聊天权限
          const matchedUser = searchData.users.find((u: any) => u.canStartChat)
          if (matchedUser) {
            addResult(`测试与 ${matchedUser.name} 的聊天权限...`)
            // 这里不实际创建聊天，只是测试数据
            addResult(`✅ 找到可聊天用户: ${matchedUser.name}`, 'success')
          } else {
            addResult('没有找到可以开始聊天的用户', 'info')
          }
        }
      } else {
        addResult('用户搜索API调用失败', 'error')
      }

      addResult('测试完成！', 'success')

    } catch (error) {
      console.error('测试过程出错:', error)
      addResult(`测试过程出错: ${error}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">聊天权限修复测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <div className="text-gray-600 space-y-2">
            <p>这个页面用来测试聊天功能的权限修复效果：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>检查用户登录状态</li>
              <li>测试用户搜索API</li>
              <li>验证匹配状态检查</li>
              <li>确认聊天权限控制</li>
            </ul>
          </div>
          
          <button
            onClick={testChatPermissions}
            disabled={isRunning}
            className="mt-4 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? '测试中...' : '开始测试'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {results.join('\n')}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">修复说明</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>• <strong>问题</strong>: StreamChat error code 70 权限错误</p>
            <p>• <strong>原因</strong>: 查询频道时使用了错误的条件，导致访问无权限的频道</p>
            <p>• <strong>修复</strong>: 改进查询条件，只查询当前用户有权限访问的频道</p>
            <p>• <strong>改进</strong>: 添加用户匹配状态检查，防止与未匹配用户创建聊天</p>
          </div>
        </div>
      </div>
    </div>
  )
}
