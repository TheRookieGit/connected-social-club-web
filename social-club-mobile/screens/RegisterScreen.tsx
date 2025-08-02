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
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthAPI, TokenManager, handleApiError } from '../lib/api'

export default function RegisterScreen() {
  const navigation = useNavigation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, age, gender } = formData

    if (!name || !email || !password || !confirmPassword || !age || !gender) {
      Alert.alert('错误', '请填写所有必填字段')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '两次输入的密码不一致')
      return
    }

    if (parseInt(age) < 18) {
      Alert.alert('错误', '年龄必须满18岁')
      return
    }

    setIsLoading(true)
    try {
      const response = await AuthAPI.register({
        name,
        email,
        password,
        age,
        gender
      })
      
      if (response.success) {
        // 保存token和用户信息
        await TokenManager.setToken(response.token)
        await AsyncStorage.setItem('user_info', JSON.stringify(response.user))
        
        Alert.alert('成功', '注册成功！', [
          { text: '确定', onPress: () => navigation.navigate('Dashboard') }
        ])
      } else {
        Alert.alert('错误', response.error || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      Alert.alert('错误', handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const goToLogin = () => {
    navigation.navigate('Login')
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>加入Social Club</Text>
          <Text style={styles.subtitle}>创建你的账户开始交友之旅</Text>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="姓名"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
            
            <TextInput
              style={styles.input}
              placeholder="邮箱地址"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="密码"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="确认密码"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="年龄"
              placeholderTextColor="#999"
              value={formData.age}
              onChangeText={(value) => updateFormData('age', value)}
              keyboardType="numeric"
            />
            
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => updateFormData('gender', 'male')}
              >
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'male' && styles.genderButtonTextActive
                ]}>
                  男性
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => updateFormData('gender', 'female')}
              >
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'female' && styles.genderButtonTextActive
                ]}>
                  女性
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? '注册中...' : '注册'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>已有账户？</Text>
            <TouchableOpacity onPress={goToLogin}>
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
    backgroundColor: '#FF69B4',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 40,
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
    marginBottom: 40,
    opacity: 0.9,
  },
  form: {
    marginBottom: 30,
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButtonActive: {
    backgroundColor: '#FF69B4',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#FF69B4',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
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
  loginLink: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
}) 