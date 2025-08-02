import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProfile, RecommendedUser } from '../types/user'
import { UserAPI, handleApiError } from '../lib/api'

const { width, height } = Dimensions.get('window')

export default function DashboardScreen() {
  const navigation = useNavigation()
  const [users, setUsers] = useState<RecommendedUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
    fetchMatchedUsers()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('user_info')
      if (userInfo) {
        setCurrentUser(JSON.parse(userInfo))
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const fetchMatchedUsers = async () => {
    try {
      const response = await UserAPI.getMatchedUsers()
      if (response.success) {
        setMatchedUsers(response.users || [])
      }
    } catch (error) {
      console.error('获取匹配用户失败:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await UserAPI.getRecommendedUsers(10, 0)
      
      if (response.success && response.users) {
        // 转换API数据格式
        const formattedUsers = response.users.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          age: user.birth_date ? calculateAge(user.birth_date) : 0,
          location: user.location || '未知',
          bio: user.bio || '暂无介绍',
          interests: user.interests || [],
          photos: user.photos || ['https://picsum.photos/400/600?random=' + user.id],
          isOnline: user.is_online || false,
        }))
        
        setUsers(formattedUsers)
      } else {
        // 如果API失败，使用备用数据
        const mockUsers: RecommendedUser[] = [
          {
            id: '1',
            name: '张三',
            age: 25,
            location: '北京',
            bio: '喜欢旅游和摄影，希望能找到一个志同道合的伴侣。',
            interests: ['摄影', '旅游', '美食', '电影'],
            photos: ['https://picsum.photos/400/600?random=1'],
            isOnline: true,
          },
          {
            id: '2',
            name: '李四',
            age: 28,
            location: '上海',
            bio: '热爱运动和音乐，性格开朗外向。',
            interests: ['运动', '音乐', '电影', '咖啡'],
            photos: ['https://picsum.photos/400/600?random=2'],
            isOnline: false,
          }
        ]
        setUsers(mockUsers)
      }
    } catch (error) {
      console.error('获取用户失败:', error)
      // 网络错误时显示备用数据
      const mockUsers: RecommendedUser[] = [
        {
          id: '1',
          name: '张三',
          age: 25,
          location: '北京',
          bio: '喜欢旅游和摄影，希望能找到一个志同道合的伴侣。',
          interests: ['摄影', '旅游', '美食', '电影'],
          photos: ['https://picsum.photos/400/600?random=1'],
          isOnline: true,
        }
      ]
      setUsers(mockUsers)
      Alert.alert('提示', '网络连接异常，显示离线数据')
    } finally {
      setIsLoading(false)
    }
  }

  // 计算年龄的辅助函数
  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleLike = async (userId: string) => {
    try {
      console.log('点赞用户:', userId)
      const response = await UserAPI.likeUser(userId, 'like')
      
      if (response.success) {
        if (response.isMatch) {
          Alert.alert('恭喜！', '你们互相喜欢，成功匹配！🎉', [
            { text: '查看匹配', onPress: openChat },
            { text: '继续浏览', onPress: nextUser }
          ])
        } else {
          Alert.alert('成功', '已点赞！')
          nextUser()
        }
      } else {
        Alert.alert('提示', response.error || '操作失败')
        nextUser()
      }
    } catch (error) {
      console.error('点赞失败:', error)
      Alert.alert('错误', handleApiError(error))
      nextUser()
    }
  }

  const handlePass = async () => {
    try {
      if (users.length > 0) {
        const userId = users[currentIndex]?.id
        if (userId) {
          await UserAPI.likeUser(userId, 'pass')
        }
      }
      nextUser()
    } catch (error) {
      console.error('跳过失败:', error)
      nextUser()
    }
  }

  const handleSuperLike = async (userId: string) => {
    try {
      console.log('超级点赞用户:', userId)
      const response = await UserAPI.likeUser(userId, 'super_like')
      
      if (response.success) {
        if (response.isMatch) {
          Alert.alert('恭喜！', '超级匹配成功！你们互相喜欢！🌟🎉', [
            { text: '查看匹配', onPress: openChat },
            { text: '继续浏览', onPress: nextUser }
          ])
        } else {
          Alert.alert('成功', '已超级点赞！⭐')
          nextUser()
        }
      } else {
        Alert.alert('提示', response.error || '操作失败')
        nextUser()
      }
    } catch (error) {
      console.error('超级点赞失败:', error)
      Alert.alert('错误', handleApiError(error))
      nextUser()
    }
  }

  const nextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // 加载更多用户
      fetchUsers()
      setCurrentIndex(0)
    }
  }

  const openChat = () => {
    navigation.navigate('Matches')
  }

  const openProfile = () => {
    navigation.navigate('Profile')
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <Text style={styles.emptyText}>暂无推荐用户</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
          <Text style={styles.refreshButtonText}>刷新</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentUserData = users[currentIndex]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={openProfile}>
          <Text style={styles.headerButtonText}>👤</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Social Club</Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={openChat}>
          <Text style={styles.headerButtonText}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        <View style={styles.userCard}>
          <Image
            source={{ uri: currentUserData.photos[0] }}
            style={styles.userImage}
            resizeMode="cover"
          />
          
          <View style={styles.userInfo}>
            <View style={styles.userHeader}>
              <Text style={styles.userName}>
                {currentUserData.name}, {currentUserData.age}
              </Text>
              <View style={[styles.onlineIndicator, { backgroundColor: currentUserData.isOnline ? '#4CAF50' : '#ccc' }]} />
            </View>
            
            <Text style={styles.userLocation}>📍 {currentUserData.location}</Text>
            <Text style={styles.userBio}>{currentUserData.bio}</Text>
            
            <View style={styles.interestsContainer}>
              {currentUserData.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
        >
          <Text style={styles.passButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleSuperLike(currentUserData.id)}
        >
          <Text style={styles.superLikeButtonText}>⭐</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleLike(currentUserData.id)}
        >
          <Text style={styles.likeButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FF69B4',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  userImage: {
    width: '100%',
    height: height * 0.5,
  },
  userInfo: {
    padding: 25,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  userBio: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#FFE6F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  passButtonText: {
    fontSize: 32,
    color: '#666',
    fontWeight: 'bold',
  },
  superLikeButton: {
    backgroundColor: '#FFD700',
  },
  superLikeButtonText: {
    fontSize: 28,
    color: '#fff',
  },
  likeButton: {
    backgroundColor: '#FF69B4',
  },
  likeButtonText: {
    fontSize: 32,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FF69B4',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#FF69B4',
    fontSize: 16,
    fontWeight: 'bold',
  },
})