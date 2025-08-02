import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MessageAPI, handleApiError } from '../lib/api'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  message_type: string
  is_read: boolean
  created_at: string
}

interface ChatScreenParams {
  userId: string
  userName: string
  userAvatar?: string
}

export default function ChatScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { userId, userName, userAvatar } = route.params as ChatScreenParams
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadCurrentUser()
    loadMessages()
    
    // 定期检查新消息
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadCurrentUser = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('user_info')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        setCurrentUserId(user.id.toString())
      }
    } catch (error) {
      console.error('获取当前用户失败:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await MessageAPI.getConversation(userId, 100, 0)
      
      if (response.success && response.messages) {
        setMessages(response.messages)
        
        // 滚动到底部
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    } catch (error) {
      console.error('获取消息失败:', error)
      if (isLoading) {
        Alert.alert('错误', handleApiError(error))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    try {
      const response = await MessageAPI.sendMessage(userId, messageText)
      
      if (response.success) {
        // 立即添加消息到本地列表
        const newMsg: Message = {
          id: response.message.id,
          sender_id: currentUserId || '',
          receiver_id: userId,
          message: messageText,
          message_type: 'text',
          is_read: false,
          created_at: new Date().toISOString(),
        }
        
        setMessages(prev => [...prev, newMsg])
        
        // 滚动到底部
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      } else {
        Alert.alert('发送失败', response.error || '消息发送失败')
        setNewMessage(messageText) // 恢复消息内容
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      Alert.alert('发送失败', handleApiError(error))
      setNewMessage(messageText) // 恢复消息内容
    } finally {
      setIsSending(false)
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === currentUserId
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.theirMessageTime
          ]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    )
  }

  const goBack = () => {
    navigation.goBack()
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
        <Text style={styles.loadingText}>加载聊天记录...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF69B4" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userName}</Text>
          <Text style={styles.headerStatus}>在线</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false })
        }}
      />

      {/* 输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="输入消息..."
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || isSending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          <Text style={styles.sendButtonText}>
            {isSending ? '⏳' : '➤'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#FF69B4',
    borderBottomRightRadius: 6,
  },
  theirMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  myMessageTime: {
    color: '#fff',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
})