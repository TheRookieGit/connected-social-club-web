'use client'

import { Heart, Search, ChevronLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white">
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

      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/help" className="hover:text-red-500 transition-colors">
            ConnectEd Elite Social Club
          </Link>
          <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
          <Link href="/help" className="hover:text-red-500 transition-colors">
            帮助中心
          </Link>
          <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
          <Link href="/help/getting-started" className="hover:text-red-500 transition-colors">
            开始使用
          </Link>
          <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
          <span className="text-gray-700">联系我们</span>
        </div>

        {/* 搜索栏 */}
        <div className="flex justify-end mb-8">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">开始使用</h3>
              <div className="space-y-2">
                <Link href="/help/getting-started/how-connect-ed-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  ConnectEd 是如何运作的？
                </Link>
                <Link href="/help/getting-started/what-is-connect-ed" className="block text-gray-600 hover:text-red-500 transition-colors">
                  什么是 ConnectEd？
                </Link>
                <Link href="/help/getting-started/community-guidelines" className="block text-gray-600 hover:text-red-500 transition-colors">
                  ConnectEd 社区准则
                </Link>
                <Link href="/help/getting-started/how-discover-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  发现模式是如何运作的？
                </Link>
                <Link href="/help/getting-started/how-likes-you-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  "喜欢我"功能是如何运作的？
                </Link>
                <Link href="/help/getting-started/how-suggested-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  推荐匹配和发现模式有什么区别？
                </Link>
                <Link href="/help/getting-started/how-algorithm-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  你们的算法是如何运作的？
                </Link>
                <Link href="/help/getting-started/lgbtqia-friendly" className="block text-red-500 font-medium">
                  你们的应用对 LGBTQIA+ 友好吗？
                </Link>
              </div>
            </div>
          </div>

          {/* 主要内容 */}
          <div className="lg:col-span-3">
            <article className="prose prose-lg max-w-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>5个月前</span>
                  <span>已更新</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">联系我们</h1>

              <div className="text-gray-700 leading-relaxed space-y-6">
                <p>
                  我们随时为您提供帮助！如果您有任何问题、建议或需要技术支持，请通过以下方式联系我们。
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">客服支持</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <MessageCircle className="h-6 w-6 text-blue-500" />
                      <h3 className="text-lg font-semibold text-blue-900">在线客服</h3>
                    </div>
                    <p className="text-blue-800 mb-4">工作时间：周一至周日 9:00-21:00</p>
                    <p className="text-blue-800">平均响应时间：5-10分钟</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Mail className="h-6 w-6 text-green-500" />
                      <h3 className="text-lg font-semibold text-green-900">邮件支持</h3>
                    </div>
                    <p className="text-green-800 mb-4">邮箱：support@connected.com</p>
                    <p className="text-green-800">响应时间：24小时内</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">紧急联系</h2>
                <div className="bg-red-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Phone className="h-6 w-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-900">紧急热线</h3>
                  </div>
                  <p className="text-red-800 mb-2">电话：400-888-8888</p>
                  <p className="text-red-800">适用于：安全问题、账户被盗、紧急情况</p>
                  <p className="text-red-800 text-sm mt-2">24小时服务</p>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">常见问题类型</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-gray-900">账户问题</h4>
                    <p>密码重置、账户锁定、个人信息修改等</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-4">
                    <h4 className="font-semibold text-gray-900">技术问题</h4>
                    <p>应用崩溃、功能异常、网络连接问题等</p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-semibold text-gray-900">会员服务</h4>
                    <p>订阅管理、费用问题、会员权益等</p>
                  </div>
                  <div className="border-l-4 border-orange-400 pl-4">
                    <h4 className="font-semibold text-gray-900">安全问题</h4>
                    <p>骚扰举报、虚假信息、不当行为等</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">联系前准备</h2>
                <p>为了更快地解决您的问题，建议您准备以下信息：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>您的用户ID或注册邮箱</li>
                  <li>问题发生的具体时间和情况</li>
                  <li>错误信息截图（如果有）</li>
                  <li>您使用的设备和应用版本</li>
                  <li>您已经尝试过的解决方法</li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                  <p className="text-yellow-800">
                    <strong>温馨提示：</strong> 我们承诺保护您的隐私，所有联系信息仅用于解决您的问题，不会用于其他目的。
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 