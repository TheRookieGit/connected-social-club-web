'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function WhatIsConnectEd() {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <span className="text-gray-700">什么是 ConnectEd？</span>
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

        <div className="flex gap-8">
          {/* 左侧导航栏 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">此部分的文章</h3>
              <div className="space-y-3">
                <Link href="/help/getting-started/how-connect-ed-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  ConnectEd 是如何运作的？
                </Link>
                <Link href="/help/getting-started/what-is-connect-ed" className="block text-red-500 font-medium">
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
                                 <Link href="/help/getting-started/lgbtqia-friendly" className="block text-gray-600 hover:text-red-500 transition-colors">
                   你们的应用对 LGBTQIA+ 友好吗？
                 </Link>
              </div>
            </div>
          </div>

          {/* 主要内容 */}
          <div className="flex-1 max-w-4xl">
            {/* 文章标题和元数据 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                什么是 ConnectEd Elite Social Club？
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>1年前</span>
                  <span>已更新</span>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  关注
                </button>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              {/* 引言部分 */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-400 p-6 rounded-r-lg mb-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  ConnectEd Elite Social Club 是一个专为<strong className="text-pink-600">认真寻找感情关系的人</strong>打造的婚恋交友平台。如果你已经厌倦了无休止的滑动、套路游戏，或者总是在错误的人身上浪费时间——那你来对地方了。
                </p>
              </div>

              {/* 核心价值 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">我们的目标</h2>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    我们的目标，是帮你和<strong className="text-blue-600">真正寻求认真关系的优质对象</strong>建立联系，让你拥有更好的约会体验。
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    与其他交友软件不同的是，我们基于你的个人偏好，用<strong className="text-blue-600">智能算法为你精挑细选匹配对象</strong>，让你可以少花时间刷人，多花时间与合适的人深入交流。
                  </p>
                </div>
              </div>

              {/* 运作方式 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">⚡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">我们是怎么做到这一点的呢？</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 每日推荐 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <span className="text-green-600 text-xl mr-2">📅</span>
                      <h3 className="text-lg font-semibold text-gray-900">每日专属推荐</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      每天中午，我们会为你送上一批专属的潜在匹配（也叫「<strong className="text-green-600">桃花对象</strong>」）。我们鼓励大家认真浏览每个资料，并通过平台内丰富的引导提问，更深入地了解彼此。
                    </p>
                  </div>

                  {/* 智能学习 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <span className="text-green-600 text-xl mr-2">🧠</span>
                      <h3 className="text-lg font-semibold text-gray-900">智能学习</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      每一次你对一个对象选择"喜欢"或"跳过"，我们都会进一步学习你的喜好，这样系统未来的推荐也会变得越来越精准。
                    </p>
                  </div>
                </div>
              </div>

              {/* 鼓励见面 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-2xl">💝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">遇到让你心动的人？</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    那就约出来见面吧，暂时放下这个 App，面对面认识彼此。你可能会坠入爱河，也可能收获一位新朋友。
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-purple-600 text-xl mr-3">✨</span>
                      <p className="text-gray-700 leading-relaxed">
                        只要你保持真实的自己，就已经在这条路上做得非常棒了。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 