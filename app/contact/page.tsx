'use client'

import { useState } from 'react'
import { Heart, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function Contact() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    cooperationType: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 模拟表单提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // 重置表单
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      cooperationType: '',
      message: ''
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-bold text-red-500 flex items-center">
                  <Heart className="mr-2 text-red-500" size={24} />
                  ConnectEd Elite Social Club
                </h1>
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 hover:text-red-500 transition-colors">
                  首页
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-red-500 transition-colors">
                  关于我们
                </Link>
                <Link href="/join-us" className="text-gray-600 hover:text-red-500 transition-colors">
                  加入我们
                </Link>
                <Link href="/news" className="text-gray-600 hover:text-red-500 transition-colors">
                  媒体合作
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* 成功提交页面 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">提交成功！</h1>
              <p className="text-gray-600 mb-6">
                感谢您的合作咨询。我们会在2-3个工作日内回复您。
              </p>
              <div className="space-y-3">
                <Link 
                  href="/contact"
                  className="block w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  提交新的咨询
                </Link>
                <Link 
                  href="/news"
                  className="block w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  返回新闻页面
                </Link>
              </div>
            </div>
          </div>
        </div>

        <SimpleFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-red-500 flex items-center">
                <Heart className="mr-2 text-red-500" size={24} />
                ConnectEd Elite Social Club
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-red-500 transition-colors">
                首页
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-red-500 transition-colors">
                关于我们
              </Link>
              <Link href="/join-us" className="text-gray-600 hover:text-red-500 transition-colors">
                加入我们
              </Link>
              <Link href="/news" className="text-gray-600 hover:text-red-500 transition-colors">
                媒体合作
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 表单部分 */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <Link 
              href="/news" 
              className="inline-flex items-center text-red-500 hover:text-red-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回新闻页面
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              合作咨询表单
            </h1>
            <p className="text-xl text-gray-600">
              请填写以下信息，我们会尽快与您联系
            </p>
          </div>

          {/* 表单 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 公司信息 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    公司/组织名称 *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="请输入您的公司或组织名称"
                  />
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                    联系人姓名 *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="请输入联系人姓名"
                  />
                </div>
              </div>

              {/* 联系信息 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="请输入您的邮箱地址"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="请输入联系电话（可选）"
                  />
                </div>
              </div>

              {/* 网站 */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  公司网站
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="https://www.example.com（可选）"
                />
              </div>

              {/* 合作类型 */}
              <div>
                <label htmlFor="cooperationType" className="block text-sm font-medium text-gray-700 mb-2">
                  合作类型 *
                </label>
                <select
                  id="cooperationType"
                  name="cooperationType"
                  value={formData.cooperationType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                >
                  <option value="">请选择合作类型</option>
                  <option value="media">媒体合作</option>
                  <option value="sponsorship">赞助合作</option>
                  <option value="partnership">战略合作</option>
                  <option value="event">活动合作</option>
                  <option value="other">其他合作</option>
                </select>
              </div>

              {/* 详细描述 */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  合作详情描述 *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="请详细描述您的合作需求、目标、预期效果等信息..."
                />
              </div>

              {/* 提交按钮 */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      提交咨询
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
} 