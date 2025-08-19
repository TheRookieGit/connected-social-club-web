// 位置权限管理工具

export interface LocationPermissionSettings {
  granted: boolean
  denied: boolean
  remembered: boolean
  lastRequested?: Date
  autoRequest: boolean
}

// 检查用户是否已经同意过位置权限
export function hasLocationPermissionBeenGranted(): boolean {
  try {
    const remembered = localStorage.getItem('location_permission_remembered')
    return remembered === 'true'
  } catch (error) {
    console.error('检查位置权限设置失败:', error)
    return false
  }
}

// 保存位置权限设置
export function saveLocationPermissionSettings(settings: Partial<LocationPermissionSettings>): void {
  try {
    const currentSettings = getLocationPermissionSettings()
    const updatedSettings = { ...currentSettings, ...settings }
    
    if (updatedSettings.remembered) {
      localStorage.setItem('location_permission_remembered', 'true')
    } else {
      localStorage.removeItem('location_permission_remembered')
    }
    
    localStorage.setItem('location_permission_settings', JSON.stringify(updatedSettings))
  } catch (error) {
    console.error('保存位置权限设置失败:', error)
  }
}

// 获取位置权限设置
export function getLocationPermissionSettings(): LocationPermissionSettings {
  try {
    const stored = localStorage.getItem('location_permission_settings')
    if (stored) {
      const settings = JSON.parse(stored)
      return {
        granted: settings.granted || false,
        denied: settings.denied || false,
        remembered: settings.remembered || false,
        lastRequested: settings.lastRequested ? new Date(settings.lastRequested) : undefined,
        autoRequest: settings.autoRequest !== false
      }
    }
  } catch (error) {
    console.error('获取位置权限设置失败:', error)
  }
  
  return {
    granted: false,
    denied: false,
    remembered: false,
    autoRequest: true
  }
}

// 检查是否应该自动请求位置权限
export function shouldAutoRequestLocation(): boolean {
  const settings = getLocationPermissionSettings()
  
  // 如果用户已经明确同意并选择记住，不再自动请求
  if (settings.granted && settings.remembered) {
    return false
  }
  
  // 如果用户明确拒绝过，不自动请求
  if (settings.denied) {
    return false
  }
  
  // 如果用户已经在24小时内被问过，不再请求
  if (settings.lastRequested) {
    const hoursSinceLastRequest = (Date.now() - settings.lastRequested.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastRequest < 24) {
      return false
    }
  }
  
  // 如果用户从未被问过，可以请求
  if (!settings.lastRequested) {
    return true
  }
  
  return false
}

// 记录位置权限请求
export function recordLocationPermissionRequest(granted: boolean, remembered: boolean = false): void {
  const settings = getLocationPermissionSettings()
  
  saveLocationPermissionSettings({
    ...settings,
    granted,
    denied: !granted,
    remembered,
    lastRequested: new Date()
  })
}

// 明确记录用户同意位置权限
export function recordUserConsent(remembered: boolean = false): void {
  const settings = getLocationPermissionSettings()
  
  saveLocationPermissionSettings({
    ...settings,
    granted: true,
    denied: false,
    remembered,
    lastRequested: new Date()
  })
}

// 明确记录用户拒绝位置权限
export function recordUserDenial(remembered: boolean = false): void {
  const settings = getLocationPermissionSettings()
  
  saveLocationPermissionSettings({
    ...settings,
    granted: false,
    denied: true,
    remembered,
    lastRequested: new Date()
  })
}

// 清除位置权限设置
export function clearLocationPermissionSettings(): void {
  try {
    localStorage.removeItem('location_permission_remembered')
    localStorage.removeItem('location_permission_settings')
  } catch (error) {
    console.error('清除位置权限设置失败:', error)
  }
}

// 检查浏览器是否支持地理位置
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator
}

// 检查位置权限状态
export async function checkLocationPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!isGeolocationSupported()) {
    return 'denied'
  }

  try {
    // 使用 Permissions API 检查权限状态
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      return result.state
    }
    
    // 如果 Permissions API 不可用，尝试获取位置来检查权限
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve('denied')
          } else {
            resolve('prompt')
          }
        },
        { timeout: 1000 }
      )
    })
  } catch (error) {
    console.error('检查位置权限状态失败:', error)
    return 'prompt'
  }
}

// 请求位置权限
export async function requestLocationPermission(): Promise<boolean> {
  if (!isGeolocationSupported()) {
    return false
  }

  try {
    // 检查用户是否已经同意过
    const settings = getLocationPermissionSettings()
    if (!settings.granted) {
      console.log('用户尚未明确同意位置权限')
      return false
    }

    // 检查用户是否拒绝过
    if (settings.denied) {
      console.log('用户已拒绝位置权限')
      return false
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })

    // 保存位置信息
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    }

    localStorage.setItem('user_location', JSON.stringify(locationData))
    
    // 记录权限获取成功
    recordLocationPermissionRequest(true)
    
    return true
  } catch (error: any) {
    console.error('请求位置权限失败:', error)
    
    // 记录权限获取失败
    recordLocationPermissionRequest(false)
    
    return false
  }
}

// 获取用户位置（如果已有权限）
export async function getUserLocation(): Promise<GeolocationPosition | null> {
  if (!isGeolocationSupported()) {
    return null
  }

  const permissionStatus = await checkLocationPermissionStatus()
  if (permissionStatus !== 'granted') {
    return null
  }

  try {
    return await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })
  } catch (error) {
    console.error('获取用户位置失败:', error)
    return null
  }
}

// 检查位置数据是否过期
export function isLocationDataExpired(maxAgeMinutes: number = 5): boolean {
  try {
    const cached = localStorage.getItem('user_location')
    if (!cached) {
      return true
    }

    const locationData = JSON.parse(cached)
    const age = Date.now() - locationData.timestamp
    return age > maxAgeMinutes * 60 * 1000
  } catch (error) {
    console.error('检查位置数据过期状态失败:', error)
    return true
  }
}

// 获取缓存的位置数据
export function getCachedLocation(): any {
  try {
    const cached = localStorage.getItem('user_location')
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error('获取缓存位置数据失败:', error)
  }
  return null
} 