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
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { UserProfile, RecommendedUser } from '../types/user'
import { supabase } from '../lib/supabase'

const { width } = Dimensions.get('window')

export default function DashboardScreen() {
  const navigation = useNavigation()
  const [users, setUsers] = useState<RecommendedUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      // 这里将集成你的认证逻辑
      console.log('获取当前用户信息...')
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // 这里将集成你的用户推荐API
      console.log('获取推荐用户...')
      
      // 临时模拟数据
      const mockUsers: RecommendedUser[] = [
        {
          id: '1',
          name: '张三',
          age: 25,
          location: '北京',
          bio: '喜欢旅游和摄影',
          interests: ['摄影', '旅游', '美食'],
          photos: ['https://picsum.photos/400/600?random=1'],
          isOnline: true,
        },
        {
          id: '2',
          name: '李四',
          age: 28,
          location: '上海',
          bio: '热爱运动和音乐',
          interests: ['运动', '音乐', '电影'],
          photos: ['https://picsum.photos/400/600?random=2'],
          isOnline: false,
        }
      ]
      
      setUsers(mockUsers)
    } catch (error) {
      console.error('获取用户失败:', error)
      Alert.alert('错误', '获取用户列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (userId: string) => {
    try {
      console.log('点赞用户:', userId)
      // 这里将集成你的点赞API
      nextUser()
    } catch (error) {
      console.error('点赞失败:', error)
      Alert.alert('错误', '点赞失败')
    }
  }

  const handlePass = () => {
    nextUser()
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Club</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <Image
            source={{ uri: currentUserData.photos[0] }}
            style={styles.userImage}
            resizeMode="cover"
          />
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUserData.name}, {currentUserData.age}
            </Text>
            <Text style={styles.userLocation}>{currentUserData.location}</Text>
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
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
        >
          <Text style={styles.passButtonText}>×</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FF69B4',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  userImage: {
    width: '100%',
    height: width * 0.8,
  },
  userInfo: {
    padding: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#ccc',
  },
  passButtonText: {
    fontSize: 30,
    color: '#666',
    fontWeight: 'bold',
  },
  likeButton: {
    backgroundColor: '#FF69B4',
  },
  likeButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})