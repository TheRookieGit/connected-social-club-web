'use client'

import { useState, useEffect } from 'react'
import { 
  shouldAutoRequestLocation, 
  getLocationPermissionSettings,
  clearLocationPermissionSettings,
  recordUserConsent
} from '@/lib/locationPermission'

export default function TestPermission() {
  const [settings, setSettings] = useState<any>(null)
  const [shouldRequest, setShouldRequest] = useState(false)

  const loadSettings = () => {
    const currentSettings = getLocationPermissionSettings()
    setSettings(currentSettings)
    setShouldRequest(shouldAutoRequestLocation())
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleClearSettings = () => {
    clearLocationPermissionSettings()
    loadSettings()
  }

  const handleGrantPermission = (remembered: boolean) => {
    recordUserConsent(remembered)
    loadSettings()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">位置权限测试</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 当前设置 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">当前权限设置</h2>
            {settings ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">已同意:</span>
                  <span className={`font-medium ${settings.granted ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.granted ? '是' : '否'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">已拒绝:</span>
                  <span className={`font-medium ${settings.denied ? 'text-red-600' : 'text-green-600'}`}>
                    {settings.denied ? '是' : '否'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">记住选择:</span>
                  <span className={`font-medium ${settings.remembered ? 'text-green-600' : 'text-gray-600'}`}>
                    {settings.remembered ? '是' : '否'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后请求:</span>
                  <span className="font-medium text-gray-900">
                    {settings.lastRequested ? new Date(settings.lastRequested).toLocaleString() : '从未'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">应该请求:</span>
                  <span className={`font-medium ${shouldRequest ? 'text-orange-600' : 'text-green-600'}`}>
                    {shouldRequest ? '是' : '否'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">加载中...</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">测试操作</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleGrantPermission(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                同意权限（不记住）
              </button>
              
              <button
                onClick={() => handleGrantPermission(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                同意权限（记住）
              </button>
              
              <button
                onClick={handleClearSettings}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                清除所有设置
              </button>
              
              <button
                onClick={loadSettings}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                刷新设置
              </button>
            </div>
          </div>
        </div>

        {/* 测试说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">测试说明</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>✅ <strong>权限逻辑:</strong> 如果用户之前没有同意过，每次登录后（包括页面刷新）都需要询问</p>
            <p>✅ <strong>记住选择:</strong> 如果用户选择记住，下次不再询问</p>
            <p>✅ <strong>拒绝处理:</strong> 如果用户拒绝，不再自动请求</p>
            <p>✅ <strong>Dashboard检查:</strong> Dashboard页面加载时会检查是否需要请求权限</p>
            <p>✅ <strong>URL参数:</strong> 支持通过URL参数触发权限请求</p>
          </div>
        </div>

        {/* 测试步骤 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">测试步骤</h3>
          <div className="text-yellow-800 space-y-2 text-sm">
            <p>1. 点击&ldquo;清除所有设置&rdquo;重置权限状态</p>
            <p>2. 刷新页面，应该显示&ldquo;应该请求: 是&rdquo;</p>
            <p>3. 点击&ldquo;同意权限（不记住）&rdquo;，然后刷新页面</p>
            <p>4. 应该再次显示&ldquo;应该请求: 是&rdquo;</p>
            <p>5. 点击&ldquo;同意权限（记住）&rdquo;，然后刷新页面</p>
            <p>6. 应该显示&ldquo;应该请求: 否&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  )
} 