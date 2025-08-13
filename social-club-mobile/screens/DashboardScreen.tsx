import React, { useState, useEffect, useRef } from 'react'
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
  Animated,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { UserAPI, ChatAPI } from '../lib/api'
import { UserProfile, RecommendedUser } from '../types/user'
import { useAuth } from '../lib/auth'

const { width, height } = Dimensions.get('window')

export default function DashboardScreen() {
  const navigation = useNavigation()
  const { setIsAuthenticated } = useAuth()
  const [users, setUsers] = useState<RecommendedUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showPendingMatches, setShowPendingMatches] = useState(false)

  // 动画相关
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(1)).current
  const rotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
    fetchMatchedUsers()
    fetchPendingMatchesCount()
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

  const fetchPendingMatchesCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${UserAPI.API_BASE_URL}/user/pending-matches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPendingMatchesCount(data.count || 0)
      }
    } catch (error) {
      console.error('获取待处理匹配数量失败:', error)
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
          // 扩展的个人资料字段
          occupation: user.occupation,
          education: user.education,
          relationship_status: user.relationship_status,
          height: user.height,
          weight: user.weight,
          ethnicity: user.ethnicity,
          religion: user.religion,
          employer: user.employer,
          school: user.school,
          degree: user.degree,
          values_preferences: user.values_preferences,
          personality_type: user.personality_type,
          languages: user.languages,
          family_plans: user.family_plans,
          has_kids: user.has_kids,
          smoking_status: user.smoking_status,
          drinking_status: user.drinking_status,
          dating_style: user.dating_style,
          relationship_goals: user.relationship_goals,
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
      console.error('获取推荐用户失败:', error)
      // 使用备用数据
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
    } finally {
      setIsLoading(false)
    }
  }

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
      const response = await UserAPI.likeUser(userId)
      
      if (response.success) {
        // 检查是否匹配
        if (response.isMatch) {
          Alert.alert(
            '🎉 匹配成功！',
            `你和 ${users[currentIndex]?.name} 互相喜欢对方！`,
            [
              { text: '开始聊天', onPress: () => openChat(userId) },
              { text: '继续浏览', onPress: () => nextUser() }
            ]
          )
        } else {
          Alert.alert('已喜欢', `你已喜欢了 ${users[currentIndex]?.name}`)
        }
        
        nextUser()
      } else {
        Alert.alert('错误', response.error || '操作失败')
      }
    } catch (error) {
      console.error('喜欢用户失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    }
  }

  const handlePass = async () => {
    try {
      const response = await UserAPI.unlikeUser(users[currentIndex]?.id || '')
      
      if (response.success) {
        Alert.alert('已跳过', `你已跳过了 ${users[currentIndex]?.name}`)
        nextUser()
      } else {
        Alert.alert('错误', response.error || '操作失败')
      }
    } catch (error) {
      console.error('跳过用户失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    }
  }

  const handleSuperLike = async (userId: string) => {
    try {
      // 这里需要实现超级喜欢逻辑
      Alert.alert('超级喜欢', `你超级喜欢了 ${users[currentIndex]?.name}！`)
      nextUser()
    } catch (error) {
      console.error('超级喜欢失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    }
  }

  const nextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1)
      // 重置动画
      translateX.setValue(0)
      translateY.setValue(0)
      scale.setValue(1)
      rotate.setValue(0)
    } else {
      // 重新加载用户
      setCurrentIndex(0)
      fetchUsers()
    }
  }

  const openChat = (userId?: string) => {
    setShowChat(true)
    // 这里可以传递特定的用户ID来打开聊天
  }

  const openProfile = () => {
    setShowProfile(true)
  }

  const openPendingMatches = () => {
    setShowPendingMatches(true)
  }

  const handleLogout = async () => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token')
            await AsyncStorage.removeItem('user_info')
            setIsAuthenticated(false)
          }
        }
      ]
    )
  }

  const currentUserData = users[currentIndex]

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>正在加载推荐用户...</Text>
      </View>
    )
  }

  if (!currentUserData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂时没有更多推荐用户</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
          <Text style={styles.refreshButtonText}>刷新</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={openProfile}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Ionicons name="heart" size={24} color="#FFFFFF" />
          <Text style={styles.headerTitleText}>ConnectEd</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton} onPress={openChat}>
          <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
          {matchedUsers.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{matchedUsers.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.mainContent}>
        {/* 用户卡片 */}
        <Animated.View
          style={[
            styles.userCard,
            {
              transform: [
                { translateX },
                { translateY },
                { scale }
              ]
            }
          ]}
        >
            <Image
              source={{ uri: currentUserData.photos[0] }}
              style={styles.userImage}
              resizeMode="cover"
            />
            
            {/* 用户信息覆盖层 */}
            <View style={styles.userInfo}>
              <View style={styles.userBasicInfo}>
                <Text style={styles.userName}>
                  {currentUserData.name}, {currentUserData.age}
                </Text>
                <View style={styles.userLocation}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                  <Text style={styles.locationText}>{currentUserData.location}</Text>
                </View>
              </View>
              
              <Text style={styles.userBio}>{currentUserData.bio}</Text>
              
              {/* 兴趣标签 */}
              <View style={styles.interestsContainer}>
                {currentUserData.interests.slice(0, 3).map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 在线状态指示器 */}
            {currentUserData.isOnline && (
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>在线</Text>
              </View>
            )}
          </Animated.View>

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={handlePass}
          >
            <Ionicons name="close" size={30} color="#FF6B6B" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={() => handleSuperLike(currentUserData.id)}
          >
            <Ionicons name="star" size={30} color="#FFD93D" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleLike(currentUserData.id)}
          >
            <Ionicons name="heart" size={30} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        {/* 待处理匹配提示 */}
        {pendingMatchesCount > 0 && (
          <TouchableOpacity style={styles.pendingMatchesButton} onPress={openPendingMatches}>
            <Text style={styles.pendingMatchesText}>
              {pendingMatchesCount} 个待处理匹配
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 底部导航栏 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentIndex(0)}>
          <Ionicons name="home" size={24} color="#EF4444" />
          <Text style={styles.navButtonText}>首页</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={openChat}>
          <Ionicons name="chatbubbles" size={24} color="#6B7280" />
          <Text style={styles.navButtonText}>聊天</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={openProfile}>
          <Ionicons name="person" size={24} color="#6B7280" />
          <Text style={styles.navButtonText}>我的</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD93D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  userCard: {
    width: width - 40,
    height: height * 0.6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  userBasicInfo: {
    marginBottom: 8,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 4,
  },
  userBio: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 4,
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  passButton: {
    backgroundColor: '#FFFFFF',
  },
  superLikeButton: {
    backgroundColor: '#FFFFFF',
  },
  likeButton: {
    backgroundColor: '#FFFFFF',
  },
  pendingMatchesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  pendingMatchesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
})