import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthAPI, TokenManager, handleApiError } from '../lib/api'

export default function LoginScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写邮箱和密码')
      return
    }

    setIsLoading(true)
    try {
      const response = await AuthAPI.login(email, password)
      
      if (response.success) {
        // 保存token和用户信息
        await TokenManager.setToken(response.token)
        await AsyncStorage.setItem('user_info', JSON.stringify(response.user))
        
        Alert.alert('成功', '登录成功！', [
          { text: '确定', onPress: () => navigation.navigate('Dashboard') }
        ])
      } else {
        Alert.alert('错误', response.error || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      Alert.alert('错误', handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const goToRegister = () => {
    navigation.navigate('Register')
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      <View style={styles.content}>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录你的Social Club账户</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="邮箱地址"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '登录中...' : '登录'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>还没有账户？</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerLink}>立即注册</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF69B4',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 50,
    opacity: 0.9,
  },
  form: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#fff',
    marginRight: 5,
  },
  registerLink: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
}) 