import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { UserAPI, handleApiError } from '../lib/api'

interface MatchedUser {
  id: string
  name: string
  age: number
  location: string
  bio: string
  photos: string[]
  isOnline: boolean
  lastMessage?: {
    message: string
    created_at: string
  }
}

export default function MatchesScreen() {
  const navigation = useNavigation()
  const [matches, setMatches] = useState<MatchedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      const response = await UserAPI.getMatchedUsers()
      
      if (response.success && response.users) {
        // 转换API数据格式
        const formattedMatches = response.users.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          age: user.birth_date ? calculateAge(user.birth_date) : 0,
          location: user.location || '未知',
          bio: user.bio || '暂无介绍',
          photos: user.photos || ['https://picsum.photos/200/200?random=' + user.id],
          isOnline: user.is_online || false,
          lastMessage: user.last_message || null,
        }))
        
        setMatches(formattedMatches)
      } else {
        // 模拟数据用于测试
        const mockMatches: MatchedUser[] = [
          {
            id: '1',
            name: '张三',
            age: 25,
            location: '北京',
            bio: '喜欢旅游和摄影',
            photos: ['https://picsum.photos/200/200?random=1'],
            isOnline: true,
            lastMessage: {
              message: '你好，很高兴认识你！',
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
            }
          },
          {
            id: '2',
            name: '李四',
            age: 28,
            location: '上海',
            bio: '热爱运动和音乐',
            photos: ['https://picsum.photos/200/200?random=2'],
            isOnline: false,
            lastMessage: {
              message: '今天天气真不错呢',
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
            }
          },
        ]
        setMatches(mockMatches)
      }
    } catch (error) {
      console.error('获取匹配失败:', error)
      Alert.alert('错误', handleApiError(error))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
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

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInHours < 24) return `${diffInHours}小时前`
    if (diffInDays < 7) return `${diffInDays}天前`
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const openChat = (match: MatchedUser) => {
    navigation.navigate('Chat', {
      userId: match.id,
      userName: match.name,
      userAvatar: match.photos[0]
    })
  }

  const goBack = () => {
    navigation.goBack()
  }

  const onRefresh = () => {
    setIsRefreshing(true)
    loadMatches()
  }

  const renderMatch = ({ item }: { item: MatchedUser }) => {
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.photos[0] }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={[
            styles.onlineIndicator,
            { backgroundColor: item.isOnline ? '#4CAF50' : 'transparent' }
          ]} />
        </View>
        
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>{item.name}, {item.age}</Text>
            {item.lastMessage && (
              <Text style={styles.lastTime}>
                {formatTime(item.lastMessage.created_at)}
              </Text>
            )}
          </View>
          
          <Text style={styles.matchLocation}>{item.location}</Text>
          
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.message}
            </Text>
          ) : (
            <Text style={styles.noMessage}>开始聊天吧...</Text>
          )}
        </View>
        
        <View style={styles.chatIcon}>
          <Text style={styles.chatIconText}>💬</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <Text style={styles.loadingText}>加载匹配列表...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>我的匹配</Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={onRefresh}>
          <Text style={styles.headerButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* 匹配列表 */}
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无匹配用户</Text>
          <Text style={styles.emptySubtext}>去发现页面寻找心仪的人吧！</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.exploreButtonText}>去发现</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          style={styles.matchesList}
          contentContainerStyle={styles.matchesContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#FF69B4"
              colors={['#FF69B4']}
            />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#FF69B4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  matchesList: {
    flex: 1,
  },
  matchesContent: {
    padding: 15,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lastTime: {
    fontSize: 12,
    color: '#999',
  },
  matchLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
  },
  noMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  chatIcon: {
    marginLeft: 10,
  },
  chatIconText: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginBottom: 30,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})