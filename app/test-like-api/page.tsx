'use client'

import { useState } from 'react'

export default function TestLikeApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLikeApi = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setResult({ error: '没有找到token' })
        return
      }

      const response = await fetch('/api/debug-test-like', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">测试喜欢API</h1>
        
        <button
          onClick={testLikeApi}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试喜欢API'}
        </button>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">结果:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 