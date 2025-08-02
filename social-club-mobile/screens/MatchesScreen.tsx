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
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { UserAPI } from '../lib/api'
import { RecommendedUser } from '../types/user'

export default function MatchesScreen() {
  const navigation = useNavigation()
  const [matchedUsers, setMatchedUsers] = useState<RecommendedUser[]>([])
  const [pendingMatches, setPendingMatches] = useState<RecommendedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'matched' | 'pending'>('matched')
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<RecommendedUser | null>(null)

  useEffect(() => {
    fetchMatchedUsers()
    fetchPendingMatches()
  }, [])

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

  const fetchPendingMatches = async () => {
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
        setPendingMatches(data.matches || [])
      }
    } catch (error) {
      console.error('获取待处理匹配失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: RecommendedUser) => {
    setSelectedUser(user)
    setShowUserProfile(true)
  }

  const handleStartChat = (user: RecommendedUser) => {
    navigation.navigate('Chat' as never, { 
      userId: user.id, 
      userName: user.name 
    } as never)
  }

  const handleAcceptMatch = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${UserAPI.API_BASE_URL}/user/accept-match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        Alert.alert('成功', '已接受匹配！')
        fetchPendingMatches()
        fetchMatchedUsers()
      } else {
        Alert.alert('错误', '操作失败')
      }
    } catch (error) {
      console.error('接受匹配失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    }
  }

  const handleRejectMatch = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${UserAPI.API_BASE_URL}/user/reject-match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        Alert.alert('已拒绝', '已拒绝此匹配')
        fetchPendingMatches()
      } else {
        Alert.alert('错误', '操作失败')
      }
    } catch (error) {
      console.error('拒绝匹配失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    }
  }

  const renderMatchedUser = ({ item }: { item: RecommendedUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
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
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => handleStartChat(item)}
        >
          <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderPendingUser = ({ item }: { item: RecommendedUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
    >
      <Image
        source={{ uri: item.photos[0] }}
        style={styles.userAvatar}
        resizeMode="cover"
      />
      
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>待处理</Text>
          </View>
        </View>
        
        <Text style={styles.userLocation}>
          <Ionicons name="location" size={12} color="#6B7280" />
          {' '}{item.location}
        </Text>
        
        <Text style={styles.userBio} numberOfLines={2}>
          {item.bio}
        </Text>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptMatch(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectMatch(item.id)}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const currentUsers = activeTab === 'matched' ? matchedUsers : pendingMatches

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
      
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>我的匹配</Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 标签页 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matched' && styles.activeTab]}
          onPress={() => setActiveTab('matched')}
        >
          <Text style={[styles.tabText, activeTab === 'matched' && styles.activeTabText]}>
            已匹配 ({matchedUsers.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            待处理 ({pendingMatches.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 用户列表 */}
      <FlatList
        data={currentUsers}
        renderItem={activeTab === 'matched' ? renderMatchedUser : renderPendingUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.userList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'matched' ? "heart-outline" : "time-outline"} 
              size={64} 
              color="#D1D5DB" 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'matched' 
                ? '暂无匹配用户' 
                : '暂无待处理匹配'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'matched' 
                ? '继续浏览，找到心仪的对象开始聊天吧！' 
                : '当有人喜欢你时，会在这里显示'
              }
            </Text>
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

                {activeTab === 'matched' && (
                  <TouchableOpacity
                    style={styles.startChatButton}
                    onPress={() => {
                      setShowUserProfile(false)
                      handleStartChat(selectedUser)
                    }}
                  >
                    <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                    <Text style={styles.startChatButtonText}>开始聊天</Text>
                  </TouchableOpacity>
                )}

                {activeTab === 'pending' && (
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={styles.acceptButtonLarge}
                      onPress={() => {
                        setShowUserProfile(false)
                        handleAcceptMatch(selectedUser.id)
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>接受</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.rejectButtonLarge}
                      onPress={() => {
                        setShowUserProfile(false)
                        handleRejectMatch(selectedUser.id)
                      }}
                    >
                      <Ionicons name="close" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>拒绝</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FEF2F2',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#EF4444',
    fontWeight: '600',
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
  pendingBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
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
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#4ECDC4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4ECDC4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
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
  startChatButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButtonLarge: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButtonLarge: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})