import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Token管理
export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token')
    } catch (error) {
      console.error('获取token失败:', error)
      return null
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token)
    } catch (error) {
      console.error('保存token失败:', error)
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token')
    } catch (error) {
      console.error('删除token失败:', error)
    }
  }
}

// HTTP请求封装
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await TokenManager.getToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API请求失败 ${endpoint}:`, error)
      throw error
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // FormData上传
  async uploadFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await TokenManager.getToken()
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`上传请求失败 ${endpoint}:`, error)
      throw error
    }
  }
}

export const api = new ApiService()

// 认证API
export const AuthAPI = {
  async login(email: string, password: string) {
    return api.post('/api/auth/login', { email, password })
  },

  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
    age?: string
    gender?: string
  }) {
    return api.post('/api/auth/register', userData)
  },

  async sendEmailCode(email: string) {
    return api.post('/api/auth/send-email-code', { email })
  },

  async verifyEmailCode(email: string, code: string) {
    return api.put('/api/auth/send-email-code', { email, code })
  }
}

// 用户API
export const UserAPI = {
  // 获取推荐用户
  async getRecommendedUsers(limit = 10, offset = 0) {
    return api.get(`/api/user/matches?limit=${limit}&offset=${offset}`)
  },

  // 获取用户资料
  async getProfile() {
    return api.get('/api/user/profile')
  },

  // 获取其他用户资料
  async getUserProfile(userId: string) {
    return api.get(`/api/user/profile/${userId}`)
  },

  // 更新用户资料
  async updateProfile(profileData: any) {
    return api.put('/api/user/profile', profileData)
  },

  // 搜索用户
  async searchUsers(query: string, limit = 10) {
    return api.get(`/api/user/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  },

  // 获取已匹配用户
  async getMatchedUsers() {
    return api.get('/api/user/matched-users')
  },

  // 获取已点赞用户
  async getLikedUsers() {
    return api.get('/api/user/liked-users')
  },

  // 点赞用户
  async likeUser(userId: string, action: 'like' | 'pass' | 'super_like') {
    return api.post('/api/user/matches', { matchedUserId: userId, action })
  },

  // 检查匹配状态
  async checkMatchStatus(userId: string) {
    return api.get(`/api/user/check-match-status/${userId}`)
  },

  // 更新位置
  async updateLocation(latitude: number, longitude: number, address?: string) {
    return api.post('/api/user/location', { latitude, longitude, address })
  },

  // 上传头像
  async uploadAvatar(imageUri: string) {
    const formData = new FormData()
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any)

    return api.uploadFormData('/api/user/upload-avatar', formData)
  },

  // 上传照片
  async uploadPhotos(imageUris: string[]) {
    const formData = new FormData()
    
    imageUris.forEach((uri, index) => {
      formData.append('photos', {
        uri: uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      } as any)
    })

    return api.uploadFormData('/api/user/upload-photos', formData)
  }
}

// 消息API
export const MessageAPI = {
  // 发送消息
  async sendMessage(receiverId: string, message: string, messageType = 'text') {
    return api.post('/api/messages/send', { receiverId, message, messageType })
  },

  // 获取聊天记录
  async getConversation(userId: string, limit = 100, offset = 0) {
    return api.get(`/api/messages/conversation?userId=${userId}&limit=${limit}&offset=${offset}`)
  },

  // 检查新消息
  async checkNewMessages() {
    return api.get('/api/messages/check-new')
  }
}

// 通用错误处理
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return '网络错误，请稍后重试'
}