// 地理位置工具库

export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

export interface AddressData {
  formatted_address: string
  city: string
  state: string
  country: string
  postal_code?: string
}

// 计算两点之间的距离（使用 Haversine 公式）
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化距离显示
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} 米`
  } else if (distance < 10) {
    return `${distance.toFixed(1)} 公里`
  } else {
    return `${Math.round(distance)} 公里`
  }
}

// 检查位置权限
export function checkLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false)
      return
    }

    navigator.permissions?.query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        resolve(result.state === 'granted')
      })
      .catch(() => {
        // 如果 permissions API 不可用，尝试获取位置来检查权限
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 1000 }
        )
      })
  })
}

// 请求位置权限
export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 5000 }
    )
  })
}

// 获取当前位置（简化版本）
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置服务'))
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
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

// 监听位置变化
export function watchLocation(
  onSuccess: (location: LocationData) => void,
  onError?: (error: string) => void
): number {
  if (!navigator.geolocation) {
    onError?.('浏览器不支持地理位置服务')
    return -1
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
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
      onError?.(errorMessage)
    },
    options
  )
}

// 停止监听位置
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

// 通过坐标获取地址信息（使用 Google Geocoding API）
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number,
  apiKey?: string
): Promise<AddressData | null> {
  if (!apiKey) {
    console.warn('需要 Google Maps API Key 来获取地址信息')
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=zh-CN`
    )
    
    if (!response.ok) {
      throw new Error('地址解析请求失败')
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('无法解析地址')
    }

    const result = data.results[0]
    const addressComponents = result.address_components

    // 解析地址组件
    const address: AddressData = {
      formatted_address: result.formatted_address,
      city: '',
      state: '',
      country: '',
      postal_code: ''
    }

    addressComponents.forEach((component: any) => {
      const types = component.types
      if (types.includes('locality')) {
        address.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name
      } else if (types.includes('country')) {
        address.country = component.long_name
      } else if (types.includes('postal_code')) {
        address.postal_code = component.long_name
      }
    })

    return address
  } catch (error) {
    console.error('地址解析失败:', error)
    return null
  }
}

// 通过地址获取坐标（使用 Google Geocoding API）
export async function getCoordinatesFromAddress(
  address: string,
  apiKey?: string
): Promise<LocationData | null> {
  if (!apiKey) {
    console.warn('需要 Google Maps API Key 来获取坐标信息')
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=zh-CN`
    )
    
    if (!response.ok) {
      throw new Error('坐标解析请求失败')
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('无法解析地址')
    }

    const result = data.results[0]
    const location = result.geometry.location

    return {
      latitude: location.lat,
      longitude: location.lng,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('坐标解析失败:', error)
    return null
  }
}

// 检查是否在指定区域内
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  targetLat: number,
  targetLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, targetLat, targetLon)
  return distance <= radiusKm
}

// 获取位置缓存
export function getLocationCache(): LocationData | null {
  try {
    const cached = localStorage.getItem('location_cache')
    if (cached) {
      const location = JSON.parse(cached)
      // 检查缓存是否过期（1小时）
      if (Date.now() - location.timestamp < 3600000) {
        return location
      }
    }
  } catch (error) {
    console.error('读取位置缓存失败:', error)
  }
  return null
}

// 设置位置缓存
export function setLocationCache(location: LocationData): void {
  try {
    localStorage.setItem('location_cache', JSON.stringify({
      ...location,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('设置位置缓存失败:', error)
  }
}

// 清除位置缓存
export function clearLocationCache(): void {
  try {
    localStorage.removeItem('location_cache')
  } catch (error) {
    console.error('清除位置缓存失败:', error)
  }
} 