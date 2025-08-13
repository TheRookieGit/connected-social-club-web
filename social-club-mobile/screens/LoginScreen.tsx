import React, { useState, useEffect } from 'react'
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
  Linking,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { UserAPI } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function LoginScreen() {
  const navigation = useNavigation()
  const { setIsAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 处理LinkedIn登录
  const handleLinkedInLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // 获取LinkedIn OAuth URL
      const result = await UserAPI.linkedinLogin()
      
      if (result.success && result.oauthUrl) {
        // 使用WebBrowser打开LinkedIn OAuth页面
        const authResult = await WebBrowser.openAuthSessionAsync(
          result.oauthUrl,
          'socialclub://auth-callback'
        )
        
        if (authResult.type === 'success' && authResult.url) {
          // 解析回调URL中的参数
          const url = new URL(authResult.url)
          const token = url.searchParams.get('token')
          const user = url.searchParams.get('user')
          const error = url.searchParams.get('error')
          
          if (error) {
            setError('LinkedIn登录失败，请重试')
            return
          }
          
          if (token && user) {
            try {
              // 解析用户数据
              const userData = JSON.parse(decodeURIComponent(user))
              
              // 保存token和用户信息
              await AsyncStorage.setItem('token', token)
              await AsyncStorage.setItem('user_info', JSON.stringify(userData))
              
              // 更新认证状态
              setIsAuthenticated(true)
            } catch (error) {
              console.error('处理LinkedIn登录数据时出错:', error)
              setError('处理登录信息时出错，请重试')
            }
          }
        } else if (authResult.type === 'cancel') {
          console.log('用户取消了LinkedIn登录')
        }
      } else {
        setError('LinkedIn登录失败，请重试')
      }
    } catch (error) {
      console.error('LinkedIn登录失败:', error)
      setError('LinkedIn登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理邮箱登录
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('请输入邮箱和密码')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await UserAPI.login(email, password)

      if (result.success) {
        // 保存token和用户信息
        await AsyncStorage.setItem('token', result.token)
        await AsyncStorage.setItem('user_info', JSON.stringify(result.user))
        
        // 更新认证状态
        setIsAuthenticated(true)
      } else {
        setError(result.error || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
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
          <View style={styles.logoContainer}>
            <Ionicons name="heart" size={32} color="#EF4444" />
            <Text style={styles.logoText}>ConnectEd Elite Social Club</Text>
          </View>
          <Text style={styles.subtitle}>找到你的真爱</Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* LinkedIn登录按钮 */}
          <TouchableOpacity
            style={styles.linkedinButton}
            onPress={handleLinkedInLogin}
            disabled={isLoading}
          >
            <Ionicons name="logo-linkedin" size={20} color="#FFFFFF" />
            <Text style={styles.linkedinButtonText}>使用LinkedIn登录</Text>
          </TouchableOpacity>

          {/* 分隔线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或使用邮箱登录</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 邮箱输入 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱地址"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 密码输入 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
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

          {/* 记住我和忘记密码 */}
          <View style={styles.optionsContainer}>
            <View style={styles.rememberContainer}>
              <TouchableOpacity style={styles.checkbox}>
                <Ionicons name="checkmark" size={16} color="#EF4444" />
              </TouchableOpacity>
              <Text style={styles.rememberText}>记住我</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>忘记密码？</Text>
            </TouchableOpacity>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleEmailLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>登录</Text>
            )}
          </TouchableOpacity>

          {/* 注册链接 */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>还没有账号？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <Text style={styles.registerLink}>立即注册</Text>
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
    marginBottom: 40,
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
  linkedinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0077B5',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  linkedinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 16,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
    color: '#374151',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#EF4444',
  },
  loginButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
}) 