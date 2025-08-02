import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { UserAPI } from '../lib/api'

export default function RegisterScreen() {
  const navigation = useNavigation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    // 验证表单
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必填字段')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await UserAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
      })

      if (result.success) {
        // 保存token和用户信息
        await AsyncStorage.setItem('token', result.token)
        await AsyncStorage.setItem('user_info', JSON.stringify(result.user))
        
        Alert.alert('注册成功', '欢迎加入ConnectEd Elite Social Club！', [
          { text: '确定', onPress: () => navigation.navigate('Dashboard' as never) }
        ])
      } else {
        setError(result.error || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#EF4444" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Ionicons name="heart" size={32} color="#EF4444" />
            <Text style={styles.logoText}>ConnectEd Elite Social Club</Text>
          </View>
          <Text style={styles.subtitle}>创建你的账户</Text>
        </View>

        {/* 注册表单 */}
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 姓名 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>姓名 *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入你的姓名"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* 邮箱 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>邮箱地址 *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 密码 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>密码 *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 确认密码 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>确认密码 *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 手机号 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>手机号码</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入手机号码（可选）"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* 年龄 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>年龄</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入年龄（可选）"
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* 性别选择 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>性别</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => updateFormData('gender', 'male')}
              >
                <Ionicons 
                  name="male" 
                  size={20} 
                  color={formData.gender === 'male' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'male' && styles.genderButtonTextActive
                ]}>
                  男
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => updateFormData('gender', 'female')}
              >
                <Ionicons 
                  name="female" 
                  size={20} 
                  color={formData.gender === 'female' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'female' && styles.genderButtonTextActive
                ]}>
                  女
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 注册按钮 */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>立即注册</Text>
            )}
          </TouchableOpacity>

          {/* 登录链接 */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>已有账号？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.loginLink}>立即登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  registerButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
})