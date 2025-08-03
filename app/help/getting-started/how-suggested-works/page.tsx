'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowSuggestedWorks() {
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
          <span className="text-gray-700">推荐匹配和发现模式有什么区别？</span>
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
                <Link href="/help/getting-started/how-suggested-works" className="block text-red-500 font-medium">
                  推荐匹配和发现模式有什么区别？
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
                「推荐」和「发现」有什么区别？
              </h1>
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
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  关注
                </button>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed space-y-6">
                <p>
                  在 ConnectEd 中，我们提供两种不同的匹配模式：「推荐」和「发现」，它们各有特色和用途。
                </p>

                {/* 推荐模式 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 text-2xl">🌟</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">🌟 推荐（Suggested）</h2>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      「推荐」是我们每天中午为你精挑细选的匹配对象列表。系统会根据你的：
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">⚙️</span>
                          <span className="text-gray-700 font-medium">偏好设置</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">📊</span>
                          <span className="text-gray-700 font-medium">历史"喜欢"与"跳过"记录</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">💕</span>
                          <span className="text-gray-700 font-medium">彼此互相喜欢的可能性</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">
                      等多个因素，每天推送一小批专属匹配对象。
                    </p>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">⏰</span>
                        <p className="text-gray-700 leading-relaxed">
                          「推荐」的节奏设计为每日限量推送，目的是避免刷人疲劳。我们重视质量胜于数量，希望你能认真了解每一位推荐对象。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 发现模式 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-600 text-2xl">🔍</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">🔍 发现（Discover）</h2>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      「发现」是你探索更多每日推荐之外用户的地方。如果你觉得推荐列表还不够，可以进一步切换到「发现」页面。
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">
                      你可以使用多种筛选器发起搜索，包括：
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">📊</span>
                            <span className="text-gray-700 font-medium">年龄范围</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">📏</span>
                            <span className="text-gray-700 font-medium">身高范围</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">📍</span>
                            <span className="text-gray-700 font-medium">距离</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">🎓</span>
                            <span className="text-gray-700 font-medium">学历</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">🌍</span>
                            <span className="text-gray-700 font-medium">种族</span>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">⏰</span>
                            <span className="text-gray-700 font-medium">最近活跃时间等</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                        <p className="text-gray-700 leading-relaxed">
                          请注意：「发现」主要是为探索更多可能性而设，你设置的搜索条件不会被保存，每次关闭 App 后需要重新设置。
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">💡</span>
                        <p className="text-gray-700 leading-relaxed">
                          在「发现」中显示的用户会符合你的性别偏好，但可能不符合你其他的偏好设置，反之你也可能不符合他们的设置条件。
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-pink-600 text-xl mr-3">🌸</span>
                        <p className="text-gray-700 leading-relaxed">
                          在「发现」页面中无法发送普通"喜欢"，你可以选择发送桃花来表达兴趣。发送桃花可让你立即出现在对方的「喜欢你的人」页面，提高被关注的机会。发送时系统会提示你使用平台虚拟货币——桃花币进行购买。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 总结对比 */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-600 text-2xl">📊</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">模式对比总结</h2>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-900">🌟 推荐模式</h3>
                        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                          <li>每日限量推送</li>
                          <li>基于算法智能匹配</li>
                          <li>免费发送"喜欢"</li>
                          <li>重视质量胜于数量</li>
                          <li>适合认真寻找伴侣</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-900">🔍 发现模式</h3>
                        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                          <li>主动探索更多用户</li>
                          <li>多种筛选条件</li>
                          <li>需要桃花币发送桃花</li>
                          <li>搜索条件不保存</li>
                          <li>适合扩大搜索范围</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
                  <p className="text-blue-800">
                    <strong>小贴士：</strong> 建议先使用「推荐」模式，如果觉得匹配对象不够多，再使用「发现」模式来探索更多可能性。两种模式结合使用，能帮助你找到最适合的伴侣。
                  </p>
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