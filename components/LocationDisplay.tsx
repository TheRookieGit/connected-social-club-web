'use client'

import { useState, useEffect, useCallback } from 'react'
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
      // 优先使用高精度查询来获取准确的地址信息
      let response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=20&accept-language=en-US&addressdetails=1&extratags=1`
      )
      
      if (!response.ok) {
        // 备用查询 - 降级到中等精度
        response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=en-US&addressdetails=1`
        )
      }
      
      if (!response.ok) {
        // 最后备用 - 使用较低精度
        response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=en-US&addressdetails=1`
        )
      }
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.address) {
          // 调试信息
          console.log('地址解析结果:', data.address)
          console.log('地址类型:', data.addresstype)
          
          // 简化的地址解析逻辑 - 直接使用 API 返回的数据
          let city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.city_district
          let postal_code = data.address.postcode
          
          // 验证邮编的合理性（拉斯维加斯地区的主要邮编）
          const validLasVegasZipCodes = [
            '89101', '89102', '89103', '89104', '89105', '89106', '89107', '89108', '89109', '89110',
            '89111', '89112', '89113', '89114', '89115', '89116', '89117', '89118', '89119', '89120',
            '89121', '89122', '89123', '89124', '89125', '89126', '89127', '89128', '89129', '89130',
            '89131', '89132', '89133', '89134', '89135', '89136', '89137', '89138', '89139', '89140',
            '89141', '89142', '89143', '89144', '89145', '89146', '89147', '89148', '89149', '89150',
            '89151', '89152', '89153', '89154', '89155', '89156', '89157', '89158', '89159', '89160',
            '89161', '89162', '89163', '89164', '89165', '89166', '89167', '89168', '89169', '89170',
            '89171', '89172', '89173', '89174', '89175', '89176', '89177', '89178', '89179', '89180',
            '89181', '89182', '89183', '89185', '89186', '89187', '89188', '89189', '89190', '89191',
            '89193', '89194', '89195', '89196', '89197', '89198', '89199'
          ]
          
          // 如果邮编不在有效列表中，尝试获取更准确的邮编
          if (postal_code && !validLasVegasZipCodes.includes(postal_code) && lat >= 36.0 && lat <= 36.5 && lng >= -115.5 && lng <= -114.5) {
            console.log('⚠️ 检测到可能不准确的邮编:', postal_code)
            // 可以在这里添加备用邮编查找逻辑
          }
          
          // 特殊处理：拉斯维加斯地区 - 如果 API 没有返回城市名，使用 Las Vegas
          if (lat >= 36.0 && lat <= 36.5 && lng >= -115.5 && lng <= -114.5) {
            if (!city || city.includes('County')) {
              city = 'Las Vegas'
            }
          }
          
          // 如果没有城市信息，尝试从 display_name 中提取
          if (!city && data.display_name) {
            const parts = data.display_name.split(', ')
            // 通常第一个部分是城市名
            if (parts.length > 0 && !parts[0].includes('County') && !parts[0].includes('州')) {
              city = parts[0]
            }
          }
          
          // 如果仍然没有城市信息，使用 county
          if (!city && data.address.county) {
            city = data.address.county
          }
          
          const address: AddressInfo = {
            city: city || '未知城市',
            state: data.address.state || data.address.province || '',
            country: data.address.country || '',
            postal_code: postal_code || '',
            formatted_address: data.display_name || ''
          }
          
          console.log('解析后的地址信息:', address)
          
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


  const loadLocation = useCallback(async () => {
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
  }, [])

  // 清除缓存并重新获取位置
  const clearCacheAndReload = useCallback(async () => {
    // 清除缓存
    localStorage.removeItem('user_location')
    localStorage.removeItem('user_address')
    
    // 重新加载位置
    await loadLocation()
  }, [loadLocation])

  // 组件挂载时加载位置
  useEffect(() => {
    loadLocation()
  }, [loadLocation])

  // 定期更新位置（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadLocation()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isLoading, loadLocation])

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
              {(() => {
                // 如果城市名包含 "County" 且没有邮编，尝试显示更具体的信息
                if (addressInfo.city.includes('County') && !addressInfo.postal_code) {
                  return addressInfo.city
                }
                // 显示格式：城市+邮编+州
                const parts = []
                parts.push(addressInfo.city)
                if (addressInfo.postal_code) {
                  parts.push(addressInfo.postal_code)
                }
                if (addressInfo.state) {
                  parts.push(addressInfo.state)
                }
                return parts.join(', ')
              })()}
            </span>
            {showRefresh && (
              <button
                onClick={loadLocation}
                onDoubleClick={clearCacheAndReload}
                className="p-1 hover:bg-gray-100 rounded"
                title="单击刷新位置，双击清除缓存"
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
                onDoubleClick={clearCacheAndReload}
                className="p-1 hover:bg-gray-100 rounded"
                title="单击刷新位置，双击清除缓存"
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
            onDoubleClick={clearCacheAndReload}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            title="单击刷新位置，双击清除缓存"
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
                  {(() => {
                    const parts = []
                    parts.push(addressInfo.city)
                    if (addressInfo.postal_code) {
                      parts.push(addressInfo.postal_code)
                    }
                    if (addressInfo.state) {
                      parts.push(addressInfo.state)
                    }
                    return parts.join(', ')
                  })()}
                </div>
                <div className="text-xs text-blue-700">
                  {addressInfo.country && `${addressInfo.country}`}
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