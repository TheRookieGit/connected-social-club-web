'use client'

import { Heart, Search, HelpCircle, MessageCircle, Shield, User, Coffee, CreditCard, Settings, Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function Help() {
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
              <Link href="/couples" className="text-gray-600 hover:text-red-500 transition-colors">
                ConnectEd 情侣
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 - 粉红色背景 */}
      <section className="bg-gradient-to-br from-pink-500 to-rose-600 py-16 relative overflow-hidden">
        {/* 装饰性图标 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 text-white opacity-20 text-4xl">🍩</div>
          <div className="absolute top-20 right-20 text-white opacity-20 text-3xl">💕</div>
          <div className="absolute bottom-10 left-1/4 text-white opacity-20 text-3xl">☕</div>
          <div className="absolute bottom-20 right-1/3 text-white opacity-20 text-4xl">💜</div>
          <div className="absolute top-1/2 left-1/3 text-white opacity-20 text-3xl">💝</div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            帮助中心
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            找到您需要的所有信息和帮助
          </p>
          
          {/* 搜索栏 */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索帮助内容..."
                                 className="w-full pl-12 pr-4 py-4 bg-white rounded-lg shadow-lg focus:ring-2 focus:ring-pink-300 focus:outline-none text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 第一行 */}
                         <Link href="/help/getting-started" className="block">
               <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
                 <div className="flex items-center space-x-3">
                   <HelpCircle className="h-6 w-6 text-pink-500" />
                   <span className="text-pink-600 font-medium">开始使用</span>
                 </div>
               </div>
             </Link>
             <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
               <div className="flex items-center space-x-3">
                 <User className="h-6 w-6 text-pink-500" />
                 <span className="text-pink-600 font-medium">个人资料与账户</span>
               </div>
             </div>
             <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
               <div className="flex items-center space-x-3">
                 <Shield className="h-6 w-6 text-pink-500" />
                 <span className="text-pink-600 font-medium">安全、隐私与保护</span>
               </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 第二行 */}
                         <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
               <div className="flex items-center space-x-3">
                 <Coffee className="h-6 w-6 text-pink-500" />
                 <span className="text-pink-600 font-medium">匹配与互动</span>
               </div>
             </div>
             <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
               <div className="flex items-center space-x-3">
                 <CreditCard className="h-6 w-6 text-pink-500" />
                 <span className="text-pink-600 font-medium">会员订阅</span>
               </div>
             </div>
             <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
               <div className="flex items-center space-x-3">
                 <Settings className="h-6 w-6 text-pink-500" />
                 <span className="text-pink-600 font-medium">故障排除</span>
               </div>
             </div>
          </div>
          
          {/* 第三行 - 居中 */}
          <div className="flex justify-center">
                         <div className="bg-white border-2 border-pink-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer">
               <div className="flex items-center space-x-3">
                 <Bell className="h-6 w-6 text-pink-500" />
                 <span className="text-pink-600 font-medium">更新与公告</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 推荐文章 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">推荐文章</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* 左列 */}
            <div className="space-y-4">
              <Link href="/help/getting-started/how-connect-ed-works" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    ConnectEd 是如何运作的？
                  </h3>
                  <p className="text-gray-600">了解我们的匹配算法和平台运作方式</p>
                </div>
              </Link>
              
              <Link href="/help/getting-started/how-to-report-users" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    如何举报不当用户？
                  </h3>
                  <p className="text-gray-600">保护自己和他人，维护社区安全</p>
                </div>
              </Link>
              
              <Link href="/help/getting-started/membership-benefits" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    ConnectEd Premium 和 Elite 会员包含什么？
                  </h3>
                  <p className="text-gray-600">详细了解会员权益和功能</p>
                </div>
              </Link>
            </div>
            
            {/* 右列 */}
            <div className="space-y-4">
              <Link href="/help/getting-started/what-is-connect-ed" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    什么是 ConnectEd？
                  </h3>
                  <p className="text-gray-600">了解我们的使命和价值观</p>
                </div>
              </Link>
              
              <Link href="/help/getting-started/how-suggested-works" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    推荐匹配和发现模式有什么区别？
                  </h3>
                  <p className="text-gray-600">了解不同的匹配方式</p>
                </div>
              </Link>
              
              <Link href="/help/getting-started/contact-us" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    联系我们
                  </h3>
                  <p className="text-gray-600">获取更多帮助和支持</p>
                </div>
              </Link>
              
              <Link href="/help/getting-started/how-to-edit-profile" className="block">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors">
                    如何编辑我的个人资料？
                  </h3>
                  <p className="text-gray-600">完善您的个人资料信息</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 最近活动 */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">最近活动</h2>
          
          <div className="space-y-6">
            {/* 安全、隐私与保护 */}
            <div className="border-l-4 border-red-500 pl-6">
              <div className="text-sm text-gray-500 mb-2">安全、隐私与保护</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
                ConnectEd 儿童安全政策
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span>文章发布于 6 个月前</span>
                <MessageCircle className="h-4 w-4 ml-2" />
                <span className="ml-1">0</span>
              </div>
            </div>
            
            {/* 个人资料与账户 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="text-sm text-gray-500 mb-2">个人资料与账户</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
                我不小心选择了错误的性别 - 如何更改？
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span>文章发布于 10 个月前</span>
                <MessageCircle className="h-4 w-4 ml-2" />
                <span className="ml-1">0</span>
              </div>
            </div>
            
            {/* 开始使用 */}
            <div className="border-l-4 border-green-500 pl-6">
              <div className="text-sm text-gray-500 mb-2">开始使用</div>
                             <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
                 ConnectEd 是如何运作的？
               </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span>评论发布于 1 年前</span>
                <MessageCircle className="h-4 w-4 ml-2" />
                <span className="ml-1">0</span>
              </div>
            </div>
            
            {/* 更新与公告 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <div className="text-sm text-gray-500 mb-2">更新与公告</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
                新地区应用（面向全球用户）
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span>评论发布于 1 年前</span>
                <MessageCircle className="h-4 w-4 ml-2" />
                <span className="ml-1">7</span>
              </div>
            </div>
            
            {/* 开始使用 */}
            <div className="border-l-4 border-green-500 pl-6">
              <div className="text-sm text-gray-500 mb-2">开始使用</div>
                             <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
                 "喜欢我"功能是如何运作的？
               </h3>
              <div className="flex items-center text-sm text-gray-500">
                <span>评论发布于 1 年前</span>
                <MessageCircle className="h-4 w-4 ml-2" />
                <span className="ml-1">3</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="text-red-500 hover:text-red-600 font-medium flex items-center justify-center mx-auto">
              查看更多
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 浮动帮助按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
                 <button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-4 shadow-lg transition-colors">
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 