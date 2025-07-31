'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera } from 'lucide-react'

export default function TestUserPhotos() {
  const router = useRouter()
  const [testPhotos] = useState([
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop'
  ])

  const handleTestWithPhotos = () => {
    // 模拟设置测试照片到localStorage
    localStorage.setItem('test_photos', JSON.stringify(testPhotos))
    router.push('/user-photos')
  }

  const handleTestWithoutPhotos = () => {
    // 清除测试照片
    localStorage.removeItem('test_photos')
    router.push('/user-photos')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Camera className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">用户照片页面测试</h1>
          <p className="text-gray-600">测试用户照片页面的不同状态</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleTestWithPhotos}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            测试有照片状态
          </button>

          <button
            onClick={handleTestWithoutPhotos}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            测试无照片状态
          </button>

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">测试说明：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 有照片状态：显示6张测试照片</li>
            <li>• 无照片状态：显示空状态提示</li>
            <li>• 可以测试照片查看、编辑等功能</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 