'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, MessageCircle, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'
import Footer from '@/components/Footer'

export default function Home() {
  const [isLogin, setIsLogin] = useState<boolean | null>(null)

  useEffect(() => {
    // 检查URL参数来决定显示哪个表单
    const urlParams = new URLSearchParams(window.location.search)
    const register = urlParams.get('register')
    const login = urlParams.get('login')
    
    if (register === 'true') {
      setIsLogin(false)
    } else if (login === 'true') {
      setIsLogin(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">ConnectEd Elite Social Club</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-red-500 transition-colors">
                功能特色
              </a>
              <Link href="/about" className="text-gray-600 hover:text-red-500 transition-colors">
                关于我们
              </Link>
              <a href="#contact" className="text-gray-600 hover:text-red-500 transition-colors">
                联系我们
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧内容 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                找到你的
                <span className="text-red-500">真爱</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                加入我们的ConnectEd Elite Social Club，与志同道合的人相遇，开启一段美好的恋爱之旅。
              </p>
            </div>

            {/* 特色功能 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">智能匹配</h3>
                  <p className="text-sm text-gray-600">基于兴趣和性格</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">实时聊天</h3>
                  <p className="text-sm text-gray-600">安全私密交流</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Star className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">优质用户</h3>
                  <p className="text-sm text-gray-600">严格身份验证</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">真诚交友</h3>
                  <p className="text-sm text-gray-600">寻找长期关系</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 右侧图片 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src="/images/8bf7c6d78cf93c54e069a76ba993f9b0.jpg"
              alt="ConnectEd 用户 - 找到真爱的美好时刻"
              fill
              className="object-cover rounded-2xl"
              priority
            />
          </motion.div>
        </div>
      </div>

             {/* 登录注册按钮部分 */}
       <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="space-y-4"
         >
           {/* 注册按钮 */}
           <button
             onClick={() => setIsLogin(false)}
             className="w-full bg-red-500 text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-red-600 transition-colors shadow-lg"
           >
             立即注册
           </button>
           
           {/* 登录按钮 */}
           <button
             onClick={() => setIsLogin(true)}
             className="w-full bg-white text-red-500 py-4 px-6 rounded-xl font-medium text-lg border-2 border-red-500 hover:bg-red-50 transition-colors shadow-lg"
           >
             已有账号？立即登录
           </button>
         </motion.div>
       </div>

       {/* 登录注册表单部分 - 条件渲染 */}
       {isLogin !== null && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.3 }}
             className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative"
           >
             {/* 关闭按钮 */}
             <button
               onClick={() => setIsLogin(null)}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             
             {isLogin ? <LoginForm /> : <RegisterForm />}
           </motion.div>
         </div>
       )}

      {/* 底部统计 */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">10万+</div>
              <div className="text-gray-600">注册用户</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">5万+</div>
              <div className="text-gray-600">成功配对</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">98%</div>
              <div className="text-gray-600">用户满意度</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-gray-600">在线支持</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
} 