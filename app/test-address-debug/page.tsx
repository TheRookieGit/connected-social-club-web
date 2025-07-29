'use client'

import { useState } from 'react'
import { MapPin, RefreshCw, Trash2 } from 'lucide-react'


interface AddressInfo {
  city: string
  state: string
  country: string
  postal_code: string
  formatted_address: string
}

export default function TestAddressDebug() {
  const [isLoading, setIsLoading] = useState(false)
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [rawData, setRawData] = useState<any>(null)
  const [error, setError] = useState('')

  const resolveAddress = async (lat: number, lng: number) => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('开始解析地址:', { lat, lng })
      
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
        console.log('Nominatim API 原始响应:', data)
        setRawData(data)
        
        if (data.address) {
          // 简化的地址解析逻辑 - 直接使用 API 返回的数据
          let city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.city_district
          let postal_code = data.address.postcode
          
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
          
          // 如果仍然没有城市信息，使用 county 但标记为县
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
        } else {
          setError('地址数据为空')
        }
      } else {
        setError(`API请求失败: ${response.status}`)
      }
    } catch (error) {
      console.error('地址解析失败:', error)
      setError(`解析失败: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    return new Promise<{latitude: number, longitude: number}>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置服务'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error(`获取位置失败: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const handleGetLocation = async () => {
    try {
      const location = await getCurrentLocation()
      console.log('获取到位置:', location)
      await resolveAddress(location.latitude, location.longitude)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const clearCache = () => {
    localStorage.removeItem('user_location')
    localStorage.removeItem('user_address')
    setAddressInfo(null)
    setRawData(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-blue-500" />
            地址解析调试页面
          </h1>
          
          <p className="text-gray-600 mb-6">
            这个页面用于调试地址解析功能，查看 Nominatim API 的原始响应和解析结果。
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={handleGetLocation}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              获取当前位置并解析地址
            </button>
            
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              清除缓存
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-900 font-medium mb-2">错误信息</h3>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {addressInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">解析结果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">地址信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">城市:</span>
                    <span className="font-medium">{addressInfo.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">州/省:</span>
                    <span className="font-medium">{addressInfo.state || '无'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">国家:</span>
                    <span className="font-medium">{addressInfo.country || '无'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">邮编:</span>
                    <span className="font-medium">{addressInfo.postal_code || '无'}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">显示格式</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>紧凑模式:</strong> {addressInfo.city}{addressInfo.postal_code ? `, ${addressInfo.postal_code}` : ''}</p>
                    <p><strong>完整模式:</strong> {addressInfo.city}{addressInfo.postal_code ? `, ${addressInfo.postal_code}` : ''}{addressInfo.state ? `, ${addressInfo.state}` : ''}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">完整地址</h3>
                <p className="text-sm text-gray-600">{addressInfo.formatted_address}</p>
              </div>
            </div>
          </div>
        )}

        {rawData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">原始 API 响应</h2>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 