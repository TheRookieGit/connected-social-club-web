'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TestCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const items = [
    { id: 1, text: "第一项" },
    { id: 2, text: "第二项" },
    { id: 3, text: "第三项" },
    { id: 4, text: "第四项" }
  ]

  const next = () => {
    console.log('Next clicked, current:', currentIndex)
    setCurrentIndex((prev) => {
      const next = prev === items.length - 1 ? 0 : prev + 1
      console.log('Next index:', next)
      return next
    })
  }

  const prev = () => {
    console.log('Prev clicked, current:', currentIndex)
    setCurrentIndex((prev) => {
      const next = prev === 0 ? items.length - 1 : prev - 1
      console.log('Prev index:', next)
      return next
    })
  }

  const goTo = (index: number) => {
    console.log('Go to clicked:', index)
    setCurrentIndex(index)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">轮播测试页面</h1>
        
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              当前项目: {items[currentIndex].text}
            </h2>
            <p className="text-gray-600">
              索引: {currentIndex + 1} / {items.length}
            </p>
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={prev}
              className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="text-center">
              <button
                onClick={() => goTo(0)}
                className="mx-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                1
              </button>
              <button
                onClick={() => goTo(1)}
                className="mx-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                2
              </button>
              <button
                onClick={() => goTo(2)}
                className="mx-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                3
              </button>
              <button
                onClick={() => goTo(3)}
                className="mx-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                4
              </button>
            </div>
            
            <button
              onClick={next}
              className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 调试信息 */}
          <div className="bg-yellow-100 p-4 rounded text-sm">
            <p>调试信息:</p>
            <p>当前索引: {currentIndex}</p>
            <p>项目总数: {items.length}</p>
            <p>当前项目: {JSON.stringify(items[currentIndex])}</p>
          </div>

          {/* 测试按钮 */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                console.log('Test button clicked!')
                setCurrentIndex(1)
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              测试按钮 - 切换到第2个
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 