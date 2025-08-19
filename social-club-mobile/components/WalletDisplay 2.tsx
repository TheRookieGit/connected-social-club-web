import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserWallet, CurrencyTransaction } from '../types/currency'
import { CurrencyService } from '../lib/currencyService'

interface WalletDisplayProps {
  onPress?: () => void
  showBalance?: boolean
}

export default function WalletDisplay({ onPress, showBalance = true }: WalletDisplayProps) {
  const [wallet, setWallet] = useState<UserWallet | null>(null)
  const [transactions, setTransactions] = useState<CurrencyTransaction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const walletData = await CurrencyService.getUserWallet()
      setWallet(walletData)
    } catch (error) {
      console.error('获取钱包失败:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const transactionsData = await CurrencyService.getTransactionHistory(50, 0)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      setShowModal(true)
      fetchTransactions()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return 'add-circle'
      case 'spend':
        return 'remove-circle'
      case 'gift':
        return 'gift'
      case 'refund':
        return 'refresh-circle'
      default:
        return 'help-circle'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return '#4CAF50'
      case 'spend':
        return '#F44336'
      case 'gift':
        return '#FF9800'
      case 'refund':
        return '#2196F3'
      default:
        return '#9E9E9E'
    }
  }

  if (!wallet && !showBalance) {
    return null
  }

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <View style={styles.walletInfo}>
          <Ionicons name="wallet" size={20} color="#FF6B6B" />
          <Text style={styles.balanceText}>
            {wallet ? `${wallet.balance}` : '0'} 桃花币
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>我的钱包</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {wallet && (
            <View style={styles.walletSummary}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>当前余额</Text>
                <Text style={styles.balanceAmount}>{wallet.balance} 桃花币</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>累计获得</Text>
                  <Text style={styles.statValue}>{wallet.total_earned}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>累计消费</Text>
                  <Text style={styles.statValue}>{wallet.total_spent}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>交易记录</Text>
            {isLoading ? (
              <ActivityIndicator size="large" color="#FF6B6B" />
            ) : (
              <ScrollView style={styles.transactionsList}>
                {transactions.length === 0 ? (
                  <Text style={styles.emptyText}>暂无交易记录</Text>
                ) : (
                  transactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionIcon}>
                        <Ionicons 
                          name={getTransactionIcon(transaction.transaction_type) as any}
                          size={20} 
                          color={getTransactionColor(transaction.transaction_type)} 
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(transaction.created_at)}
                        </Text>
                      </View>
                      <View style={styles.transactionAmount}>
                        <Text 
                          style={[
                            styles.amountText,
                            { color: getTransactionColor(transaction.transaction_type) }
                          ]}
                        >
                          {transaction.transaction_type === 'earn' || transaction.transaction_type === 'refund' ? '+' : '-'}
                          {transaction.amount}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  walletSummary: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionsSection: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  transactionsList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
}) 