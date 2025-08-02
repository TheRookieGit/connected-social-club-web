import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { UserAPI } from '../lib/api'
import { UserProfile } from '../types/user'

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // 编辑状态的数据
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    age: '',
    location: '',
    occupation: '',
    education: '',
    interests: [] as string[],
    relationship_goals: [] as string[],
    dating_style: '',
    family_plans: '',
    has_kids: '',
    smoking_status: '',
    drinking_status: '',
    height: '',
    weight: '',
    ethnicity: '',
    religion: '',
    languages: [] as string[],
    personality_type: '',
    values_preferences: [] as string[],
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await UserAPI.getUserProfile()
      
      if (response.success) {
        const userData = response.user || response
        setCurrentUser(userData)
        
        // 初始化编辑数据
        setEditData({
          name: userData.name || '',
          bio: userData.bio || '',
          age: userData.age?.toString() || '',
          location: userData.location || '',
          occupation: userData.occupation || '',
          education: userData.education || '',
          interests: userData.interests || [],
          relationship_goals: userData.relationship_goals || [],
          dating_style: userData.dating_style || '',
          family_plans: userData.family_plans || '',
          has_kids: userData.has_kids?.toString() || '',
          smoking_status: userData.smoking_status || '',
          drinking_status: userData.drinking_status || '',
          height: userData.height?.toString() || '',
          weight: userData.weight?.toString() || '',
          ethnicity: userData.ethnicity || '',
          religion: userData.religion || '',
          languages: userData.languages || [],
          personality_type: userData.personality_type || '',
          values_preferences: userData.values_preferences || [],
        })
      } else {
        Alert.alert('错误', response.error || '获取用户资料失败')
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      const response = await UserAPI.updateUserProfile(editData)
      
      if (response.success) {
        setCurrentUser(response.user)
        setIsEditing(false)
        Alert.alert('成功', '个人资料已更新')
      } else {
        Alert.alert('错误', response.error || '更新失败')
      }
    } catch (error) {
      console.error('更新用户资料失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (permissionResult.granted === false) {
        Alert.alert('权限错误', '需要相册权限来上传照片')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true)
        
        const response = await UserAPI.uploadAvatar(result.assets[0].uri)
        
        if (response.success) {
          setCurrentUser(prev => prev ? { ...prev, avatar_url: response.avatar_url } : null)
          Alert.alert('成功', '头像已更新')
        } else {
          Alert.alert('错误', response.error || '上传失败')
        }
      }
    } catch (error) {
      console.error('上传头像失败:', error)
      Alert.alert('错误', '网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user_info')
      navigation.navigate('Login' as never)
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
        <Text style={styles.errorText}>无法加载用户资料</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
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
        
        <Text style={styles.headerTitle}>个人资料</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.headerButtonText}>
            {isEditing ? '取消' : '编辑'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像和基本信息 */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => isEditing && setShowPhotoPicker(true)}
            disabled={!isEditing}
          >
            <Image
              source={{ 
                uri: currentUser.avatar_url || 'https://picsum.photos/200/200?random=1' 
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            {isEditing && (
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.basicInfo}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userAge}>{currentUser.age}岁</Text>
            <Text style={styles.userLocation}>
              <Ionicons name="location" size={16} color="#6B7280" />
              {' '}{currentUser.location || '未设置'}
            </Text>
          </View>
        </View>

        {/* 编辑表单 */}
        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>基本信息</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>姓名</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.name}
                  onChangeText={(value) => updateEditField('name', value)}
                  placeholder="请输入姓名"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>个人简介</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editData.bio}
                  onChangeText={(value) => updateEditField('bio', value)}
                  placeholder="介绍一下自己..."
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>年龄</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.age}
                  onChangeText={(value) => updateEditField('age', value)}
                  placeholder="请输入年龄"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>位置</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.location}
                  onChangeText={(value) => updateEditField('location', value)}
                  placeholder="请输入位置"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>职业和教育</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>职业</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.occupation}
                  onChangeText={(value) => updateEditField('occupation', value)}
                  placeholder="请输入职业"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>教育背景</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.education}
                  onChangeText={(value) => updateEditField('education', value)}
                  placeholder="请输入教育背景"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>个人特征</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>身高 (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.height}
                  onChangeText={(value) => updateEditField('height', value)}
                  placeholder="请输入身高"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>体重 (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.weight}
                  onChangeText={(value) => updateEditField('weight', value)}
                  placeholder="请输入体重"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 保存按钮 */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>保存更改</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* 只读信息 */
          <View style={styles.readOnlyInfo}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>个人简介</Text>
              <Text style={styles.infoText}>
                {currentUser.bio || '暂无个人简介'}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>职业信息</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>职业：</Text>
                <Text style={styles.infoValue}>
                  {currentUser.occupation || '未设置'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>教育：</Text>
                <Text style={styles.infoValue}>
                  {currentUser.education || '未设置'}
                </Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>兴趣爱好</Text>
              <View style={styles.interestsContainer}>
                {currentUser.interests && currentUser.interests.length > 0 ? (
                  currentUser.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>暂无兴趣爱好</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 设置选项 */}
        <View style={styles.settingsSection}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings" size={20} color="#6B7280" />
            <Text style={styles.settingText}>设置</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowLogoutConfirm(true)}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={[styles.settingText, styles.logoutText]}>退出登录</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 照片选择器 */}
      <Modal
        visible={showPhotoPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.photoPickerModal}>
          <View style={styles.photoPickerHeader}>
            <Text style={styles.photoPickerTitle}>选择照片</Text>
            <TouchableOpacity onPress={() => setShowPhotoPicker(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoPickerContent}>
            <TouchableOpacity 
              style={styles.photoOption}
              onPress={() => {
                setShowPhotoPicker(false)
                handlePhotoUpload()
              }}
            >
              <Ionicons name="images" size={32} color="#EF4444" />
              <Text style={styles.photoOptionText}>从相册选择</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 设置模态框 */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>设置</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>隐私设置</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>显示在线状态</Text>
                <Switch value={true} onValueChange={() => {}} />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>允许陌生人查看资料</Text>
                <Switch value={false} onValueChange={() => {}} />
              </View>
            </View>
            
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>通知设置</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>新匹配通知</Text>
                <Switch value={true} onValueChange={() => {}} />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>新消息通知</Text>
                <Switch value={true} onValueChange={() => {}} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 退出确认 */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>确认退出</Text>
            <Text style={styles.confirmText}>确定要退出登录吗？</Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.confirmButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.confirmButtonDanger]}
                onPress={handleLogout}
              >
                <Text style={[styles.confirmButtonText, styles.confirmButtonTextDanger]}>
                  确定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
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
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userAge: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  editForm: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#EF4444',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  readOnlyInfo: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
    width: 60,
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  interestsContainer: {
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
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  logoutText: {
    color: '#EF4444',
  },
  photoPickerModal: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  photoPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  photoPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  photoPickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photoOption: {
    alignItems: 'center',
    padding: 20,
  },
  photoOptionText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
  },
  settingsModal: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingsContent: {
    flex: 1,
  },
  settingGroup: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  confirmButtonDanger: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButtonTextDanger: {
    color: '#FFFFFF',
  },
})