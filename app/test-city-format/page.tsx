'use client'

import { useState } from 'react'
import LocationDisplay from '@/components/LocationDisplay'
import { MapPin, RefreshCw } from 'lucide-react'

export default function TestCityFormat() {
  const [testMode, setTestMode] = useState<'compact' | 'full'>('compact')

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-blue-500" />
            城市格式测试页面
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              测试位置显示格式：<strong>城市名, 邮编</strong>（例如：Las Vegas, 89113）
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setTestMode('compact')}
                className={`px-4 py-2 rounded-lg ${
                  testMode === 'compact' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                紧凑模式
              </button>
              <button
                onClick={() => setTestMode('full')}
                className={`px-4 py-2 rounded-lg ${
                  testMode === 'full' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                完整模式
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            位置显示测试 - {testMode === 'compact' ? '紧凑模式' : '完整模式'}
          </h2>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">预期格式：</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 紧凑模式：<code className="bg-gray-200 px-1 rounded">Las Vegas, 89113</code></p>
              <p>• 完整模式：<code className="bg-gray-200 px-1 rounded">Las Vegas, 89113, Nevada</code></p>
            </div>
          </div>
          
          <LocationDisplay 
            compact={testMode === 'compact'} 
            showRefresh={true}
            className="border-2 border-dashed border-blue-300"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">测试说明</h2>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>确保您已授予位置权限，否则将显示&quot;位置不可用&quot;</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>地址解析需要网络连接，首次获取可能需要几秒钟</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>如果地址解析失败，将显示坐标信息</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>点击刷新按钮可以重新获取位置和地址信息</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">格式说明</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• <strong>紧凑模式</strong>：显示为 <code>城市名, 邮编</code> 格式</p>
            <p>• <strong>完整模式</strong>：显示为 <code>城市名, 邮编, 州/省</code> 格式</p>
            <p>• 如果没有邮编信息，只显示城市名</p>
            <p>• 使用免费的 OpenStreetMap Nominatim API 进行地址解析</p>
          </div>
        </div>
      </div>
    </div>
  )
} 