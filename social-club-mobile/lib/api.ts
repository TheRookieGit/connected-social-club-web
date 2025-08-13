import AsyncStorage from '@react-native-async-storage/async-storage'

// 使用与web端相同的API基础URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-domain.com/api'

// 与web端相同的API类
export class UserAPI {
  // 登录
  static async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 注册
  static async register(userData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // LinkedIn登录
  static async linkedinLogin() {
    try {
      // 在移动端，我们需要使用WebView或深度链接来处理LinkedIn OAuth
      // 这里返回LinkedIn OAuth URL
      return { 
        success: true, 
        oauthUrl: `${API_BASE_URL}/auth/linkedin` 
      }
    } catch (error) {
      console.error('LinkedIn登录失败:', error)
      return { success: false, error: 'LinkedIn登录失败' }
    }
  }

  // 获取推荐用户
  static async getRecommendedUsers(limit = 10, offset = 0) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/search?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('获取推荐用户失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取已匹配用户
  static async getMatchedUsers() {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/matched-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('获取匹配用户失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 喜欢用户
  static async likeUser(userId: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/like/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('喜欢用户失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 取消喜欢
  static async unlikeUser(userId: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/unlike/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('取消喜欢失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取用户资料
  static async getUserProfile() {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新用户资料
  static async updateUserProfile(profileData: any) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('更新用户资料失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 上传头像
  static async uploadAvatar(imageUri: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const formData = new FormData()
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      } as any)

      const response = await fetch(`${API_BASE_URL}/user/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('上传头像失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 上传照片
  static async uploadPhotos(imageUris: string[]) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const formData = new FormData()
      imageUris.forEach((uri, index) => {
        formData.append('photos', {
          uri: uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`
        } as any)
      })

      const response = await fetch(`${API_BASE_URL}/user/upload-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('上传照片失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新位置
  static async updateLocation(locationData: any) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(locationData)
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('更新位置失败:', error)
      return { success: false, error: '网络错误' }
    }
  }
}

// 聊天API类
export class ChatAPI {
  // 获取Stream Chat令牌
  static async getStreamToken() {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/stream/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('获取Stream token失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取对话列表
  static async getConversations() {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/messages/conversation`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('获取对话列表失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 发送消息
  static async sendMessage(recipientId: string, message: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          message: message
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('发送消息失败:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 开始对话
  static async startConversation(recipientId: string) {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return { success: false, error: '未登录' }
      }

      const response = await fetch(`${API_BASE_URL}/user/start-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: recipientId
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('开始对话失败:', error)
      return { success: false, error: '网络错误' }
    }
  }
}

// 通用错误处理函数
export function handleApiError(error: any) {
  console.error('API错误:', error)
  if (error.response) {
    return error.response.data?.error || '服务器错误'
  }
  return '网络错误，请检查网络连接'
}