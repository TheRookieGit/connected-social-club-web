import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { UserAPI } from '../lib/api'
import { UserProfile, RecommendedUser } from '../types/user'

interface ChatScreenProps {
  route?: {
    params?: {
      userId?: string
      userName?: string
    }
  }
}

export default function ChatScreen({ route }: ChatScreenProps) {
  const navigation = useNavigation()
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<RecommendedUser | null>(null)

  const routeParams = route?.params

  useEffect(() => {
    fetchMatchedUsers()
    fetchCurrentUser()
    setIsLoading(false)
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

  const handleUserSelect = (user: RecommendedUser) => {
    Alert.alert('聊天功能', '聊天功能正在开发中，敬请期待！')
  }

  const handleUserProfile = (user: RecommendedUser) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  const renderUserItem = ({ item }: { item: RecommendedUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
      onLongPress={() => handleUserProfile(item)}
    >
      <Image
        source={{ uri: item.photos[0] }}
        style={styles.userAvatar}
        resizeMode="cover"
      />
      
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.isOnline && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>在线</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.userLocation}>
          <Ionicons name="location" size={12} color="#6B7280" />
          {' '}{item.location}
        </Text>
        
        <Text style={styles.userBio} numberOfLines={2}>
          {item.bio}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  )



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
      
      {/* 聊天列表头部 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>聊天</Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 匹配用户列表 */}
      <FlatList
        data={matchedUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.userList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>暂无匹配用户</Text>
            <Text style={styles.emptySubtext}>继续浏览，找到心仪的对象开始聊天吧！</Text>
          </View>
        }
      />

      {/* 用户资料模态框 */}
      <Modal
        visible={showUserProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.profileModal}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>用户资料</Text>
            <TouchableOpacity onPress={() => setShowUserProfile(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedUser && (
            <ScrollView style={styles.profileContent}>
              <Image
                source={{ uri: selectedUser.photos[0] }}
                style={styles.profileImage}
                resizeMode="cover"
              />
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {selectedUser.name}, {selectedUser.age}
                </Text>
                
                <View style={styles.profileLocation}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.profileLocationText}>{selectedUser.location}</Text>
                </View>
                
                <Text style={styles.profileBio}>{selectedUser.bio}</Text>
                
                <View style={styles.interestsContainer}>
                  <Text style={styles.interestsTitle}>兴趣爱好</Text>
                  <View style={styles.interestsList}>
                    {selectedUser.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
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
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userList: {
    padding: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#4ECDC4',
  },
  userLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  chatUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatUserDetails: {
    flex: 1,
  },
  chatUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatUserStatus: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  moreButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  profileModal: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileContent: {
    flex: 1,
  },
  profileImage: {
    width: '100%',
    height: 300,
  },
  profileInfo: {
    padding: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileLocationText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  profileBio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  interestsContainer: {
    marginTop: 20,
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#374151',
    fontSize: 14,
  },
})