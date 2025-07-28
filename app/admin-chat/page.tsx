'use client'

import { useState, useEffect, useCallback } from 'react'

interface ChatMessage {
  id: number
  senderId: number
  receiverId: number
  senderName: string
  senderEmail: string
  receiverName: string
  receiverEmail: string
  content: string
  messageType: string
  isRead: boolean
  isDeleted: boolean
  createdAt: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalMessages: number
  messagesPerPage: number
}

export default function AdminChatRecords() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    messagesPerPage: 50
  })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  })

  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }

      const queryParams = new URLSearchParams()
      if (filters.userId) queryParams.append('userId', filters.userId)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      queryParams.append('page', filters.page.toString())
      queryParams.append('limit', filters.limit.toString())

      const response = await fetch(`/api/admin/chat-records?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages)
          setPagination(data.pagination)
        } else {
          alert('获取聊天记录失败: ' + data.error)
        }
      } else {
        alert('请求失败')
      }
    } catch (error) {
      alert('获取聊天记录异常: ' + error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const deleteMessage = async (messageId: number) => {
    if (!confirm('确定要删除这条消息吗？')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/chat-records', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('消息已删除')
          fetchMessages() // 重新加载
        } else {
          alert('删除失败: ' + data.error)
        }
      } else {
        alert('删除请求失败')
      }
    } catch (error) {
      alert('删除异常: ' + error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['ID', '发送者', '接收者', '消息内容', '类型', '已读', '已删除', '发送时间'].join(','),
      ...messages.map(msg => [
        msg.id,
        `"${msg.senderName}"`,
        `"${msg.receiverName}"`,
        `"${msg.content.replace(/"/g, '""')}"`,
        msg.messageType,
        msg.isRead ? '是' : '否',
        msg.isDeleted ? '是' : '否',
        new Date(msg.createdAt).toLocaleString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `chat_records_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'string' ? parseInt(value) : value) // 确保page始终为number类型
    }))
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">聊天记录管理</h1>
          <p className="text-gray-600">查看和管理所有用户的聊天记录</p>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">筛选条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="输入用户ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">搜索内容</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="搜索消息内容..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={fetchMessages}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '查询中...' : '查询'}
              </button>
              
              <button
                onClick={exportToCSV}
                disabled={messages.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                导出CSV
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              总计 {pagination.totalMessages} 条记录
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发送者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    接收者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    消息内容
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">加载中...</span>
                      </div>
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      没有找到聊天记录
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {message.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {message.senderName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {message.senderId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {message.receiverName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {message.receiverId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {truncateMessage(message.content)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {message.messageType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.isRead 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.isRead ? '已读' : '未读'}
                          </span>
                          {message.isDeleted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              已删除
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedMessage(message)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看
                          </button>
                          {!message.isDeleted && (
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, pagination.currentPage + 1))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{(pagination.currentPage - 1) * pagination.messagesPerPage + 1}</span> 到{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.messagesPerPage, pagination.totalMessages)}
                    </span>{' '}
                    条，共 <span className="font-medium">{pagination.totalMessages}</span> 条记录
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1))}
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handleFilterChange('page', page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === pagination.currentPage - 3 ||
                        page === pagination.currentPage + 3
                      ) {
                        return <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                      }
                      return null
                    })}
                    
                    <button
                      onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 消息详情弹窗 */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">消息详情</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">消息ID：</span>
                    <span className="text-gray-900">{selectedMessage.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">发送者：</span>
                    <span className="text-gray-900">{selectedMessage.senderName} ({selectedMessage.senderId})</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">接收者：</span>
                    <span className="text-gray-900">{selectedMessage.receiverName} ({selectedMessage.receiverId})</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">消息内容：</span>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">消息类型：</span>
                    <span className="text-gray-900">{selectedMessage.messageType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">状态：</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedMessage.isRead 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedMessage.isRead ? '已读' : '未读'}
                    </span>
                    {selectedMessage.isDeleted && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        已删除
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">发送时间：</span>
                    <span className="text-gray-900">{formatTime(selectedMessage.createdAt)}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  {!selectedMessage.isDeleted && (
                    <button
                      onClick={() => {
                        deleteMessage(selectedMessage.id)
                        setSelectedMessage(null)
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      删除消息
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 