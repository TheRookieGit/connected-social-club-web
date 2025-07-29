'use client'

import { useState, useEffect } from 'react'
import { MapPin, RefreshCw, Globe } from 'lucide-react'
import { getCurrentLocation, formatDistance, type LocationData } from '@/lib/location'

interface AddressInfo {
  city: string
  state: string
  country: string
  postal_code: string
  formatted_address: string
}

interface LocationDisplayProps {
  className?: string
  showRefresh?: boolean
  compact?: boolean
}

export default function LocationDisplay({ 
  className = '', 
  showRefresh = true, 
  compact = false 
}: LocationDisplayProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // 解析地址信息
  const resolveAddress = async (lat: number, lng: number) => {
    try {
      // 使用免费的 Nominatim API (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=zh-CN`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.address) {
          const address: AddressInfo = {
            city: data.address.city || data.address.town || data.address.village || data.address.county || '未知城市',
            state: data.address.state || data.address.province || '',
            country: data.address.country || '',
            postal_code: data.address.postcode || '',
            formatted_address: data.display_name || ''
          }
          
          setAddressInfo(address)
          
          // 缓存地址信息
          localStorage.setItem('user_address', JSON.stringify({
            ...address,
            timestamp: Date.now()
          }))
        }
      }
    } catch (error) {
      console.error('地址解析失败:', error)
    }
  }

  // 加载位置信息
  const loadLocation = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 首先尝试从localStorage获取缓存的位置
      const cached = localStorage.getItem('user_location')
      const cachedAddress = localStorage.getItem('user_address')
      
      if (cached) {
        const cachedLocation = JSON.parse(cached)
        const age = Date.now() - cachedLocation.timestamp
        // 如果缓存时间少于5分钟，直接使用
        if (age < 5 * 60 * 1000) {
          setLocation(cachedLocation)
          setLastUpdate(new Date(cachedLocation.timestamp))
          
          // 加载缓存的地址信息
          if (cachedAddress) {
            const address = JSON.parse(cachedAddress)
            const addressAge = Date.now() - address.timestamp
            if (addressAge < 60 * 60 * 1000) { // 地址缓存1小时
              setAddressInfo(address)
            }
          }
          
          setIsLoading(false)
          return
        }
      }

      // 获取新位置
      const newLocation = await getCurrentLocation()
      setLocation(newLocation)
      setLastUpdate(new Date())
      
      // 解析地址信息
      await resolveAddress(newLocation.latitude, newLocation.longitude)
      
      // 保存到localStorage
      localStorage.setItem('user_location', JSON.stringify(newLocation))
      
      // 更新到服务器
      const token = localStorage.getItem('token')
      if (token) {
        try {
          await fetch('/api/user/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newLocation)
          })
        } catch (error) {
          console.error('更新位置到服务器失败:', error)
        }
      }
    } catch (err: any) {
      setError(err.message)
      console.error('获取位置失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 组件挂载时加载位置
  useEffect(() => {
    loadLocation()
  }, [])

  // 定期更新位置（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadLocation()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isLoading])

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <MapPin className="h-4 w-4 text-gray-500" />
        {isLoading ? (
          <div className="flex items-center space-x-1">
            <RefreshCw className="h-3 w-3 text-gray-400 animate-spin" />
            <span className="text-xs text-gray-500">定位中...</span>
          </div>
        ) : addressInfo ? (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600">
              {addressInfo.city}
              {addressInfo.postal_code && ` (${addressInfo.postal_code})`}
            </span>
            {showRefresh && (
              <button
                onClick={loadLocation}
                className="p-1 hover:bg-gray-100 rounded"
                title="刷新位置"
              >
                <RefreshCw className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>
        ) : location ? (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">解析地址中...</span>
            {showRefresh && (
              <button
                onClick={loadLocation}
                className="p-1 hover:bg-gray-100 rounded"
                title="刷新位置"
              >
                <RefreshCw className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>
        ) : error ? (
          <span className="text-xs text-red-500">位置不可用</span>
        ) : (
          <span className="text-xs text-gray-400">未获取位置</span>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-900">当前位置</h3>
        </div>
        {showRefresh && (
          <button
            onClick={loadLocation}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            title="刷新位置"
          >
            <RefreshCw className={`h-4 w-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>正在获取位置...</span>
        </div>
      ) : location ? (
        <div className="space-y-2">
          {addressInfo ? (
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  {addressInfo.city}
                  {addressInfo.state && `, ${addressInfo.state}`}
                </div>
                <div className="text-xs text-blue-700">
                  {addressInfo.postal_code && `邮编: ${addressInfo.postal_code}`}
                  {addressInfo.country && ` • ${addressInfo.country}`}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">纬度:</span>
                  <span className="ml-1 font-mono text-gray-900">
                    {location.latitude.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">经度:</span>
                  <span className="ml-1 font-mono text-gray-900">
                    {location.longitude.toFixed(6)}
                  </span>
                </div>
                {location.accuracy && (
                  <div>
                    <span className="text-gray-500">精度:</span>
                    <span className="ml-1 text-gray-900">
                      {location.accuracy.toFixed(1)} 米
                    </span>
                  </div>
                )}
                {lastUpdate && (
                  <div>
                    <span className="text-gray-500">更新:</span>
                    <span className="ml-1 text-gray-900">
                      {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">纬度:</span>
                <span className="ml-1 font-mono text-gray-900">
                  {location.latitude.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">经度:</span>
                <span className="ml-1 font-mono text-gray-900">
                  {location.longitude.toFixed(6)}
                </span>
              </div>
              {location.accuracy && (
                <div>
                  <span className="text-gray-500">精度:</span>
                  <span className="ml-1 text-gray-900">
                    {location.accuracy.toFixed(1)} 米
                  </span>
                </div>
              )}
              {lastUpdate && (
                <div>
                  <span className="text-gray-500">更新:</span>
                  <span className="ml-1 text-gray-900">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className="col-span-2 text-xs text-gray-500">
                正在解析地址信息...
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <a
              href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Globe className="h-3 w-3" />
              <span>Google 地图</span>
            </a>
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-800"
            >
              <Globe className="h-3 w-3" />
              <span>OpenStreetMap</span>
            </a>
          </div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>位置获取失败</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
          <button
            onClick={loadLocation}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>位置信息不可用</span>
          </div>
          <button
            onClick={loadLocation}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            获取位置
          </button>
        </div>
      )}
    </div>
  )
} 