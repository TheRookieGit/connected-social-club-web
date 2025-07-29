'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, Globe, AlertCircle } from 'lucide-react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface LocationServiceProps {
  onLocationUpdate?: (location: LocationData) => void
  autoUpdate?: boolean
  updateInterval?: number // 毫秒
}

export default function LocationService({ 
  onLocationUpdate, 
  autoUpdate = false, 
  updateInterval = 30000 
}: LocationServiceProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isWatching, setIsWatching] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  // 获取当前位置
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置服务'))
        return
      }

      const options = {
        enableHighAccuracy: true, // 高精度
        timeout: 10000, // 10秒超时
        maximumAge: 60000 // 缓存1分钟
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
          resolve(locationData)
        },
        (error) => {
          let errorMessage = '获取位置失败'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '用户拒绝了位置请求'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置信息不可用'
              break
            case error.TIMEOUT:
              errorMessage = '获取位置超时'
              break
            default:
              errorMessage = '未知错误'
          }
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }

  // 开始监听位置变化
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('浏览器不支持地理位置服务')
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        setLocation(locationData)
        setError('')
        onLocationUpdate?.(locationData)
      },
      (error) => {
        let errorMessage = '监听位置失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了位置请求'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMessage = '获取位置超时'
            break
          default:
            errorMessage = '未知错误'
        }
        setError(errorMessage)
      },
      options
    )

    setWatchId(id)
    setIsWatching(true)
  }, [onLocationUpdate])

  // 停止监听位置变化
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsWatching(false)
    }
  }, [watchId])

  // 手动获取位置
  const handleGetLocation = useCallback(async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const locationData = await getCurrentLocation()
      setLocation(locationData)
      onLocationUpdate?.(locationData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [onLocationUpdate])

  // 自动更新位置
  useEffect(() => {
    if (autoUpdate) {
      startWatching()
      
      return () => {
        stopWatching()
      }
    }
  }, [autoUpdate, startWatching, stopWatching])

  // 定期更新位置
  useEffect(() => {
    if (autoUpdate && updateInterval > 0) {
      const interval = setInterval(() => {
        handleGetLocation()
      }, updateInterval)

      return () => clearInterval(interval)
    }
  }, [autoUpdate, updateInterval, handleGetLocation])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [stopWatching])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">地理位置服务</h3>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 位置信息显示 */}
      {location && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">纬度:</span>
              <span className="ml-2 text-gray-900">{location.latitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">经度:</span>
              <span className="ml-2 text-gray-900">{location.longitude.toFixed(6)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">精度:</span>
              <span className="ml-2 text-gray-900">{location.accuracy.toFixed(1)} 米</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">时间:</span>
              <span className="ml-2 text-gray-900">
                {new Date(location.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* 地图链接 */}
          <div className="mt-3">
            <a
              href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <Globe className="h-4 w-4 mr-1" />
              在 Google 地图中查看
            </a>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isLoading ? '获取中...' : '获取当前位置'}
        </button>

        {!isWatching ? (
          <button
            onClick={startWatching}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            开始监听位置
          </button>
        ) : (
          <button
            onClick={stopWatching}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            停止监听位置
          </button>
        )}
      </div>

      {/* 状态指示器 */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isWatching ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          {isWatching ? '正在监听位置变化' : '未监听位置'}
        </div>
      </div>
    </div>
  )
} 