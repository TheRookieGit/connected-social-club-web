'use client'

import { Heart, Search, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function MembershipBenefits() {
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
          <span className="text-gray-700">会员权益</span>
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
                  推荐匹配是如何运作的？
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
                  <span>6个月前</span>
                  <span>已更新</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">ConnectEd Premium 和 Elite 会员包含什么？</h1>

              <div className="text-gray-700 leading-relaxed space-y-6">
                <p>
                  ConnectEd 提供两种高级会员选项：Premium 和 Elite，为您提供更丰富的功能和更好的体验。
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">ConnectEd Premium 会员</h2>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">每月 ¥99</h3>
                  <ul className="list-disc pl-6 space-y-2 text-blue-800">
                    <li>无限喜欢和超级喜欢</li>
                    <li>查看谁喜欢了您</li>
                    <li>撤销最后一次滑动</li>
                    <li>每月5次超级喜欢</li>
                    <li>每月1次个人资料提升</li>
                    <li>查看您与匹配对象的共同好友</li>
                    <li>优先客服支持</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">ConnectEd Elite 会员</h2>
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-pink-900 mb-4">每月 ¥199</h3>
                  <p className="text-pink-800 mb-4">包含所有 Premium 功能，外加：</p>
                  <ul className="list-disc pl-6 space-y-2 text-pink-800">
                    <li>无限超级喜欢</li>
                    <li>无限个人资料提升</li>
                    <li>查看所有喜欢您的人</li>
                    <li>优先匹配算法</li>
                    <li>专属活动邀请</li>
                    <li>高级筛选选项</li>
                    <li>24/7 专属客服</li>
                    <li>每月免费咖啡约会券</li>
                  </ul>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">如何升级会员？</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>打开 ConnectEd 应用</li>
                  <li>点击个人资料页面</li>
                  <li>选择"会员订阅"</li>
                  <li>选择您想要的会员类型</li>
                  <li>完成支付即可享受会员权益</li>
                </ol>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">会员权益说明</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">无限喜欢和超级喜欢</h4>
                    <p>不再受每日喜欢数量限制，可以无限制地表达兴趣。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">查看谁喜欢了您</h4>
                    <p>在匹配之前就能看到谁对您感兴趣，提高匹配效率。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">个人资料提升</h4>
                    <p>让您的个人资料在30分钟内获得更多曝光，增加匹配机会。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">优先匹配算法</h4>
                    <p>Elite 会员享受更精准的匹配推荐，提高找到理想伴侣的概率。</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                  <p className="text-yellow-800">
                    <strong>温馨提示：</strong> 会员订阅会自动续费，您可以在设置中随时取消。所有会员权益在订阅期间内有效。
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