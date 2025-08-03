'use client'

import { useState } from 'react'

export default function TestSetPhotos() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const setTestPhotos = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('没有找到登录token')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/set-test-photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || '设置照片失败')
      }
    } catch (error) {
      setError(`网络错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">设置测试照片</h1>
      
      <div className="mb-6">
        <button
          onClick={setTestPhotos}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? '设置中...' : '设置测试照片'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>错误:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功:</strong> {result.message}
        </div>
      )}

      {result && result.results && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">设置结果</h2>
          <div className="space-y-4">
            {result.results.map((item: any, index: number) => (
              <div key={index} className="border rounded p-4">
                <div className="font-semibold">用户: {item.email}</div>
                <div className="text-sm">
                  {item.success ? (
                    <div className="text-green-600">
                      ✅ 成功设置 {item.photo_count} 张照片
                      <div className="mt-2">
                        <strong>照片URL:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {item.photos.map((photo: string, photoIndex: number) => (
                            <li key={photoIndex}>
                              <a href={photo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {photo}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      ❌ 失败: {item.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 