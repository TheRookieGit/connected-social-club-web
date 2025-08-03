'use client'

import { useState } from 'react'

export default function TestImages() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const testImages = [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=600&fit=crop'
  ]

  const testImageAccess = async () => {
    setLoading(true)
    setResults([])

    const imageResults = []

    for (const imageUrl of testImages) {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' })
        const isAccessible = response.ok
        imageResults.push({
          url: imageUrl,
          accessible: isAccessible,
          status: response.status,
          statusText: response.statusText
        })
      } catch (error) {
        imageResults.push({
          url: imageUrl,
          accessible: false,
          error: error.message
        })
      }
    }

    setResults(imageResults)
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">图片访问测试</h1>
      
      <button
        onClick={testImageAccess}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 disabled:opacity-50"
      >
        {loading ? '测试中...' : '测试图片访问'}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">测试结果</h2>
          {results.map((result, index) => (
            <div key={index} className="border rounded p-4">
              <div className="font-semibold">图片 {index + 1}:</div>
              <div className="text-sm text-gray-600 mb-2">{result.url}</div>
              <div className={`font-medium ${result.accessible ? 'text-green-600' : 'text-red-600'}`}>
                {result.accessible ? '✅ 可访问' : '❌ 不可访问'}
              </div>
              {result.status && (
                <div className="text-sm">状态码: {result.status} - {result.statusText}</div>
              )}
              {result.error && (
                <div className="text-sm text-red-600">错误: {result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">图片预览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testImages.map((imageUrl, index) => (
            <div key={index} className="border rounded p-4">
              <h3 className="font-semibold mb-2">图片 {index + 1}</h3>
              <img
                src={imageUrl}
                alt={`测试图片 ${index + 1}`}
                className="w-full h-64 object-cover rounded"
                onError={(e) => {
                  console.log(`图片加载失败: ${imageUrl}`)
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => {
                  console.log(`图片加载成功: ${imageUrl}`)
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 