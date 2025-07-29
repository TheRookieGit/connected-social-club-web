'use client'

import { useState } from 'react'
import LocationDisplay from '@/components/LocationDisplay'

export default function TestAddress() {
  const [showLocation, setShowLocation] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">地址解析测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">测试说明</h2>
          <div className="space-y-2 text-gray-600">
            <p>• 此页面用于测试地址解析功能</p>
            <p>• 点击下方按钮显示位置组件</p>
            <p>• 位置信息会显示城市名称和邮编，而不是坐标</p>
            <p>• 使用免费的 OpenStreetMap Nominatim API 进行地址解析</p>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowLocation(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            显示位置组件
          </button>
          <button
            onClick={() => setShowLocation(false)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            隐藏位置组件
          </button>
        </div>

        {showLocation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 紧凑模式 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">紧凑模式（Dashboard样式）</h3>
              <LocationDisplay compact={true} showRefresh={true} />
            </div>

            {/* 完整模式 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">完整模式</h3>
              <LocationDisplay compact={false} showRefresh={true} />
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">功能特点</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>✅ <strong>用户友好:</strong> 显示城市名称和邮编，而不是坐标</p>
            <p>✅ <strong>隐私保护:</strong> 只有在用户明确同意后才获取位置</p>
            <p>✅ <strong>地址解析:</strong> 使用免费API将坐标转换为可读地址</p>
            <p>✅ <strong>智能缓存:</strong> 位置数据缓存5分钟，地址数据缓存1小时</p>
            <p>✅ <strong>错误处理:</strong> 网络错误时显示友好提示</p>
            <p>✅ <strong>多语言支持:</strong> 地址信息支持中文显示</p>
          </div>
        </div>
      </div>
    </div>
  )
} 