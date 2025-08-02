import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StatusBar,
  Switch,
  Modal,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { UserAPI, TokenManager, handleApiError } from '../lib/api'

interface UserProfile {
  id: string
  name: string
  email: string
  bio: string
  location: string
  occupation: string
  age: number
  gender: string
  avatar_url?: string
  photos: string[]
  interests: string[]
}

const INTEREST_OPTIONS = [
  '摄影', '旅游', '美食', '电影', '音乐', '运动', '阅读', '游戏',
  '艺术', '舞蹈', '瑜伽', '健身', '咖啡', '宠物', '编程', '绘画'
]

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showInterestsModal, setShowInterestsModal] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    loadProfile()
    requestPermissions()
  }, [])

  const requestPermissions = async () => {
    // 请求相机和相册权限
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('权限提示', '需要相机和相册权限来上传照片')
    }

    // 请求位置权限
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()
    if (locationStatus !== 'granted') {
      Alert.alert('权限提示', '需要位置权限来更新您的位置信息')
    }
  }

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await UserAPI.getProfile()
      
      if (response.success && response.user) {
        const userProfile: UserProfile = {
          id: response.user.id.toString(),
          name: response.user.name || '',
          email: response.user.email || '',
          bio: response.user.bio || '',
          location: response.user.location || '',
          occupation: response.user.occupation || '',
          age: response.user.birth_date ? calculateAge(response.user.birth_date) : 0,
          gender: response.user.gender || '',
          avatar_url: response.user.avatar_url || '',
          photos: response.user.photos || [],
          interests: response.user.interests || []
        }
        setProfile(userProfile)
        setEditedProfile(userProfile)
      } else {
        // 从本地存储获取基本信息
        const userInfo = await AsyncStorage.getItem('user_info')
        if (userInfo) {
          const user = JSON.parse(userInfo)
          const basicProfile: UserProfile = {
            id: user.id.toString(),
            name: user.name || '',
            email: user.email || '',
            bio: '',
            location: '',
            occupation: '',
            age: 0,
            gender: user.gender || '',
            avatar_url: '',
            photos: [],
            interests: []
          }
          setProfile(basicProfile)
          setEditedProfile(basicProfile)
        }
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
      Alert.alert('错误', handleApiError(error))
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

  const updateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('权限被拒绝', '无法获取位置信息')
        return
      }

      Alert.alert('获取位置', '正在获取您的位置信息...')
      
      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      
      // 获取地址信息
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })
      
      if (addresses.length > 0) {
        const address = addresses[0]
        const locationString = `${address.city || ''} ${address.district || ''}`
        
        setEditedProfile(prev => ({ ...prev, location: locationString }))
        
        // 同时更新到服务器
        await UserAPI.updateLocation(latitude, longitude, locationString)
        
        Alert.alert('成功', '位置信息已更新')
      }
    } catch (error) {
      console.error('获取位置失败:', error)
      Alert.alert('错误', '获取位置信息失败')
    }
  }

  const pickImage = async (type: 'avatar' | 'photos') => {
    Alert.alert(
      '选择图片',
      '请选择图片来源',
      [
        { text: '相机', onPress: () => openCamera(type) },
        { text: '相册', onPress: () => openLibrary(type) },
        { text: '取消', style: 'cancel' }
      ]
    )
  }

  const openCamera = async (type: 'avatar' | 'photos') => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [4, 5],
      quality: 0.8,
    })

    if (!result.canceled) {
      uploadImage(result.assets[0].uri, type)
    }
  }

  const openLibrary = async (type: 'avatar' | 'photos') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [4, 5],
      quality: 0.8,
      allowsMultipleSelection: type === 'photos',
      selectionLimit: type === 'photos' ? 5 : 1,
    })

    if (!result.canceled) {
      if (type === 'avatar') {
        uploadImage(result.assets[0].uri, type)
      } else {
        const imageUris = result.assets.map(asset => asset.uri)
        uploadImages(imageUris)
      }
    }
  }

  const uploadImage = async (imageUri: string, type: 'avatar' | 'photos') => {
    try {
      Alert.alert('上传中', '正在上传图片...')
      
      if (type === 'avatar') {
        const response = await UserAPI.uploadAvatar(imageUri)
        if (response.success) {
          setEditedProfile(prev => ({ ...prev, avatar_url: response.avatar_url }))
          Alert.alert('成功', '头像上传成功')
        }
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      Alert.alert('错误', handleApiError(error))
    }
  }

  const uploadImages = async (imageUris: string[]) => {
    try {
      Alert.alert('上传中', '正在上传照片...')
      
      const response = await UserAPI.uploadPhotos(imageUris)
      if (response.success) {
        setEditedProfile(prev => ({ 
          ...prev, 
          photos: [...(prev.photos || []), ...response.photo_urls]
        }))
        Alert.alert('成功', '照片上传成功')
      }
    } catch (error) {
      console.error('上传照片失败:', error)
      Alert.alert('错误', handleApiError(error))
    }
  }

  const saveProfile = async () => {
    try {
      setIsSaving(true)
      const response = await UserAPI.updateProfile(editedProfile)
      
      if (response.success) {
        setProfile({ ...profile, ...editedProfile } as UserProfile)
        setIsEditing(false)
        Alert.alert('成功', '个人资料已更新')
      } else {
        Alert.alert('错误', response.error || '更新失败')
      }
    } catch (error) {
      console.error('保存资料失败:', error)
      Alert.alert('错误', handleApiError(error))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleInterest = (interest: string) => {
    const currentInterests = editedProfile.interests || []
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    
    setEditedProfile(prev => ({ ...prev, interests: newInterests }))
  }

  const logout = async () => {
    Alert.alert(
      '确认退出',
      '是否确定要退出登录？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: async () => {
            await TokenManager.removeToken()
            await AsyncStorage.removeItem('user_info')
            navigation.navigate('Login')
          }
        }
      ]
    )
  }

  const goBack = () => {
    navigation.goBack()
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <Text style={styles.loadingText}>加载个人资料...</Text>
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <Text style={styles.errorText}>无法加载个人资料</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
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
        
        <Text style={styles.headerTitle}>个人资料</Text>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? '取消' : '编辑'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像部分 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => isEditing && pickImage('avatar')}
            disabled={!isEditing}
          >
            <Image
              source={{
                uri: editedProfile.avatar_url || profile.avatar_url || 'https://picsum.photos/200/200?random=avatar'
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
            {isEditing && (
              <View style={styles.avatarOverlay}>
                <Text style={styles.avatarOverlayText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.profileName}>
            {editedProfile.name || profile.name}
          </Text>
          <Text style={styles.profileLocation}>
            {editedProfile.location || profile.location || '未设置位置'}
          </Text>
        </View>

        {/* 基本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>姓名</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={editedProfile.name || ''}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
                placeholder="请输入姓名"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.name}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>个人简介</Text>
            {isEditing ? (
              <TextInput
                style={[styles.fieldInput, styles.multilineInput]}
                value={editedProfile.bio || ''}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
                placeholder="介绍一下自己..."
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.bio || '暂无个人简介'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>职业</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={editedProfile.occupation || ''}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, occupation: text }))}
                placeholder="请输入职业"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.occupation || '未设置'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>位置</Text>
              {isEditing && (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={updateLocation}
                >
                  <Text style={styles.locationButtonText}>📍 获取位置</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.fieldValue}>
              {editedProfile.location || profile.location || '未设置位置'}
            </Text>
          </View>
        </View>

        {/* 兴趣爱好 */}
        <View style={styles.section}>
          <View style={styles.fieldRow}>
            <Text style={styles.sectionTitle}>兴趣爱好</Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.editInterestsButton}
                onPress={() => setShowInterestsModal(true)}
              >
                <Text style={styles.editInterestsButtonText}>编辑</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.interestsContainer}>
            {(editedProfile.interests || profile.interests || []).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
            {(!editedProfile.interests || editedProfile.interests.length === 0) && (
              <Text style={styles.noInterests}>暂未设置兴趣爱好</Text>
            )}
          </View>
        </View>

        {/* 照片 */}
        <View style={styles.section}>
          <View style={styles.fieldRow}>
            <Text style={styles.sectionTitle}>我的照片</Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.addPhotosButton}
                onPress={() => pickImage('photos')}
              >
                <Text style={styles.addPhotosButtonText}>+ 添加照片</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.photosGrid}>
            {(editedProfile.photos || profile.photos || []).map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.photoItem}
                resizeMode="cover"
              />
            ))}
            {(!editedProfile.photos || editedProfile.photos.length === 0) && (
              <Text style={styles.noPhotos}>暂无照片</Text>
            )}
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionSection}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={saveProfile}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? '保存中...' : '保存更改'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>退出登录</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 兴趣编辑模态框 */}
      <Modal
        visible={showInterestsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInterestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择兴趣爱好</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowInterestsModal(false)}
              >
                <Text style={styles.modalCloseText}>完成</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.interestOptions}>
                {INTEREST_OPTIONS.map((interest, index) => {
                  const isSelected = (editedProfile.interests || []).includes(interest)
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.interestOption,
                        isSelected && styles.interestOptionSelected
                      ]}
                      onPress={() => toggleInterest(interest)}
                    >
                      <Text style={[
                        styles.interestOptionText,
                        isSelected && styles.interestOptionTextSelected
                      ]}>
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#FF69B4',
    fontWeight: 'bold',
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
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlayText: {
    fontSize: 30,
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  field: {
    marginBottom: 15,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  locationButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#FFE6F0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '500',
  },
  noInterests: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  editInterestsButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editInterestsButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  noPhotos: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  addPhotosButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addPhotosButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  interestOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  interestOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  interestOptionSelected: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  interestOptionText: {
    fontSize: 14,
    color: '#666',
  },
  interestOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
})