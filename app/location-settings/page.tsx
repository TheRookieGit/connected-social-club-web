'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Settings, ArrowLeft, Check, X, RefreshCw } from 'lucide-react'
import { 
  getLocationPermissionSettings,
  recordUserConsent,
  recordUserDenial,
  clearLocationPermissionSettings,
  requestLocationPermission,
  getCachedLocation
} from '@/lib/locationPermission'

export default function LocationSettings() {
  const router = useRouter()
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [message, setMessage] = useState('')

  const loadSettings = () => {
    const currentSettings = getLocationPermissionSettings()
    setSettings(currentSettings)
    
    // 加载当前位置信息
    const cached = getCachedLocation()
    setCurrentLocation(cached)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleEnableLocation = async (remember: boolean = true) => {
    setIsLoading(true)
    setMessage('')

    try {
      // 记录用户同意
      recordUserConsent(remember)
      
      // 尝试获取位置
      const success = await requestLocationPermission()
      
      if (success) {
        setMessage('✅ 位置权限已开启，正在获取位置信息...')
        loadSettings()
      } else {
        setMessage('⚠️ 浏览器拒绝了位置请求，请检查浏览器设置')
      }
    } catch (error) {
      setMessage('❌ 开启位置权限失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableLocation = (remember: boolean = true) => {
    recordUserDenial(remember)
    setMessage('❌ 位置权限已关闭')
    loadSettings()
  }

  const handleTestLocation = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const success = await requestLocationPermission()
      if (success) {
        setMessage('✅ 位置获取成功')
        const cached = getCachedLocation()
        setCurrentLocation(cached)
      } else {
        setMessage('❌ 位置获取失败')
      }
    } catch (error) {
      setMessage('❌ 位置测试失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = () => {
    clearLocationPermissionSettings()
    localStorage.removeItem('user_location')
    localStorage.removeItem('user_address')
    setCurrentLocation(null)
    setMessage('🔄 位置设置已重置')
    loadSettings()
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">位置权限设置</h1>
                <p className="text-sm text-gray-600">管理您的位置信息和隐私设置</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 消息提示 */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 当前状态 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              当前状态
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">位置权限</span>
                <div className="flex items-center">
                  {settings.granted ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">已开启</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <X className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">已关闭</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">记住选择</span>
                <div className="flex items-center">
                  {settings.remembered ? (
                    <div className="flex items-center text-blue-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">是</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <X className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">否</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">最后询问时间</span>
                <span className="text-sm text-gray-600">
                  {settings.lastRequested 
                    ? new Date(settings.lastRequested).toLocaleString()
                    : '从未'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* 操作面板 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
            
            <div className="space-y-3">
              {!settings.granted ? (
                <>
                  <button
                    onClick={() => handleEnableLocation(true)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    开启位置权限（记住选择）
                  </button>
                  
                  <button
                    onClick={() => handleEnableLocation(false)}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    开启位置权限（临时）
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleDisableLocation(true)}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    关闭位置权限（记住选择）
                  </button>
                  
                  <button
                    onClick={() => handleDisableLocation(false)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    关闭位置权限（临时）
                  </button>
                  
                  <button
                    onClick={handleTestLocation}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? '测试中...' : '测试位置获取'}
                  </button>
                </>
              )}
              
              <button
                onClick={handleResetSettings}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                重置所有设置
              </button>
            </div>
          </div>
        </div>

        {/* 当前位置信息 */}
        {currentLocation && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              当前位置信息
            </h2>
            
            {/* 地址信息显示 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-medium text-blue-900">
                {(() => {
                  try {
                    const cachedAddress = localStorage.getItem('user_address')
                    if (cachedAddress) {
                      const address = JSON.parse(cachedAddress)
                      return `${address.city}${address.postal_code ? `, ${address.postal_code}` : ''}`
                    }
                    return '正在解析地址...'
                  } catch (error) {
                    return '地址解析失败'
                  }
                })()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600">纬度</div>
                <div className="font-mono text-gray-900">{currentLocation.latitude?.toFixed(6)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600">经度</div>
                <div className="font-mono text-gray-900">{currentLocation.longitude?.toFixed(6)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600">精度</div>
                <div className="text-gray-900">{currentLocation.accuracy?.toFixed(1)} 米</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600">获取时间</div>
                <div className="text-gray-900">
                  {new Date(currentLocation.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <a
                href={`https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                在Google地图中查看
              </a>
              <a
                href={`https://www.openstreetmap.org/?mlat=${currentLocation.latitude}&mlon=${currentLocation.longitude}&zoom=15`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                在OpenStreetMap中查看
              </a>
            </div>
          </div>
        )}

        {/* 隐私说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">隐私保护说明</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• 您的位置信息仅用于为您推荐附近的用户</p>
            <p>• 位置数据会安全加密存储在我们的服务器上</p>
            <p>• 您可以随时更改或删除位置权限设置</p>
            <p>• 我们不会将您的精确位置信息分享给其他用户</p>
            <p>• 关闭位置权限不会影响应用的其他功能</p>
          </div>
        </div>
      </div>
    </div>
  )
} 