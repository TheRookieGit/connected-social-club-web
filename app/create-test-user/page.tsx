'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateTestUser() {
  const [formData, setFormData] = useState({
    email: '',
    password: 'password123',
    name: '',
    phone: '',
    birth_date: '',
    gender: 'female'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/admin/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`测试用户创建成功！\n邮箱: ${data.user.email}\n密码: ${formData.password}`)
        // 清空表单
        setFormData({
          email: '',
          password: 'password123',
          name: '',
          phone: '',
          birth_date: '',
          gender: 'female'
        })
      } else {
        setError(data.error || '创建失败')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const generateRandomUser = () => {
    const names = ['张美丽', '李英俊', '王可爱', '刘帅气', '陈温柔', '杨阳光', '赵优雅', '孙活泼']
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomDomain = domains[Math.floor(Math.random() * domains.length)]
    const randomNumber = Math.floor(Math.random() * 1000)
    
    setFormData({
      email: `test${randomNumber}@${randomDomain}`,
      password: 'password123',
      name: randomName,
      phone: `+86${Math.floor(Math.random() * 90000000000) + 10000000000}`,
      birth_date: `${1990 + Math.floor(Math.random() * 20)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      gender: Math.random() > 0.5 ? 'female' : 'male'
    })
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6">创建测试用户</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱 *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码 *
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="password123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="测试用户"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号 *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="+8613800138000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生日 *
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性别 *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="female">女性</option>
              <option value="male">男性</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={generateRandomUser}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              生成随机用户
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? '创建中...' : '创建用户'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-medium mb-2">创建成功！</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium mb-2">创建失败</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
} 