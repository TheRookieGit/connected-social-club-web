'use client'

import { useState, useEffect } from 'react'
import LocationService from '@/components/LocationService'
import { 
  getCurrentLocation, 
  watchLocation, 
  clearLocationWatch,
  calculateDistance,
  formatDistance,
  checkLocationPermission,
  requestLocationPermission,
  getLocationCache,
  setLocationCache,
  clearLocationCache,
  type LocationData 
} from '@/lib/location'

export default function TestLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string>('检查中...')
  const [distance, setDistance] = useState<number | null>(null)
  const [testLocation] = useState<LocationData>({
    latitude: 39.9042,
    longitude: 116.4074,
    timestamp: Date.now()
  })

  useEffect(() => {
    checkPermission()
    loadCachedLocation()
  }, [])

  const checkPermission = async () => {
    const hasPermission = await checkLocationPermission()
    setPermissionStatus(hasPermission ? '已授权' : '未授权')
  }

  const loadCachedLocation = () => {
    const cached = getLocationCache()
    if (cached) {
      setCurrentLocation(cached)
    }
  }

  const handleGetLocation = async () => {
    try {
      const location = await getCurrentLocation()
      setCurrentLocation(location)
      setLocationCache(location)
      
      // 计算与测试位置的距离
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        testLocation.latitude,
        testLocation.longitude
      )
      setDistance(dist)
    } catch (error: any) {
      alert(`获取位置失败: ${error.message}`)
    }
  }

  const handleStartWatching = () => {
    const id = watchLocation(
      (location) => {
        setCurrentLocation(location)
        setLocationCache(location)
        
        // 计算与测试位置的距离
        const dist = calculateDistance(
          location.latitude,
          location.longitude,
          testLocation.latitude,
          testLocation.longitude
        )
        setDistance(dist)
      },
      (error) => {
        alert(`监听位置失败: ${error}`)
        setIsWatching(false)
      }
    )
    
    setWatchId(id)
    setIsWatching(true)
  }

  const handleStopWatching = () => {
    if (watchId !== null) {
      clearLocationWatch(watchId)
      setWatchId(null)
      setIsWatching(false)
    }
  }

  const handleRequestPermission = async () => {
    const granted = await requestLocationPermission()
    setPermissionStatus(granted ? '已授权' : '未授权')
    if (granted) {
      alert('位置权限已获取！')
    } else {
      alert('位置权限被拒绝')
    }
  }

  const handleClearCache = () => {
    clearLocationCache()
    setCurrentLocation(null)
    setDistance(null)
    alert('位置缓存已清除')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">地理位置服务测试</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：地理位置服务组件 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">地理位置服务组件</h2>
            <LocationService 
              onLocationUpdate={(location) => {
                setCurrentLocation(location)
                setLocationCache(location)
              }}
            />
          </div>

          {/* 右侧：测试功能 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">权限状态</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">位置权限:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  permissionStatus === '已授权' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {permissionStatus}
                </span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                请求位置权限
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">位置控制</h2>
              <div className="space-y-3">
                <button
                  onClick={handleGetLocation}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  获取当前位置
                </button>
                
                {!isWatching ? (
                  <button
                    onClick={handleStartWatching}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    开始监听位置
                  </button>
                ) : (
                  <button
                    onClick={handleStopWatching}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    停止监听位置
                  </button>
                )}
                
                <button
                  onClick={handleClearCache}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  清除位置缓存
                </button>
              </div>
            </div>

            {/* 当前位置信息 */}
            {currentLocation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">当前位置</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">纬度:</span>
                    <span className="font-mono">{currentLocation.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">经度:</span>
                    <span className="font-mono">{currentLocation.longitude.toFixed(6)}</span>
                  </div>
                  {currentLocation.accuracy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">精度:</span>
                      <span className="font-mono">{currentLocation.accuracy.toFixed(1)} 米</span>
                    </div>
                  )}
                  {currentLocation.timestamp && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">时间:</span>
                      <span className="font-mono">
                        {new Date(currentLocation.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 距离计算 */}
            {distance !== null && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">距离计算</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">到北京天安门:</span>
                    <span className="font-semibold text-blue-600">
                      {formatDistance(distance)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    测试坐标: {testLocation.latitude.toFixed(4)}, {testLocation.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            )}

            {/* 地图链接 */}
            {currentLocation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">地图查看</h2>
                <div className="space-y-2">
                  <a
                    href={`https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                  >
                    在 Google 地图中查看
                  </a>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${currentLocation.latitude}&mlon=${currentLocation.longitude}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700"
                  >
                    在 OpenStreetMap 中查看
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• <strong>权限检查:</strong> 首先检查浏览器是否支持地理位置服务</p>
            <p>• <strong>权限请求:</strong> 用户需要授权位置访问权限</p>
            <p>• <strong>获取位置:</strong> 可以一次性获取当前位置</p>
            <p>• <strong>监听位置:</strong> 持续监听位置变化，适合导航应用</p>
            <p>• <strong>位置缓存:</strong> 缓存位置信息，减少重复请求</p>
            <p>• <strong>距离计算:</strong> 使用 Haversine 公式计算两点间距离</p>
            <p>• <strong>地图集成:</strong> 提供到 Google Maps 和 OpenStreetMap 的链接</p>
          </div>
        </div>
      </div>
    </div>
  )
} 