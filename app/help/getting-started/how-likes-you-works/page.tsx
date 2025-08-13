'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowLikesYouWorks() {
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
          <span className="text-gray-700">"喜欢我"功能是如何运作的？</span>
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
                <Link href="/help/getting-started/how-likes-you-works" className="block text-red-500 font-medium">
                  "喜欢我"功能是如何运作的？
                </Link>
                <Link href="/help/getting-started/how-suggested-works" className="block text-gray-600 hover:text-red-500 transition-colors">
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
                「喜欢你的人（Likes You）」是如何运作的？
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>4个月前</span>
                  <span>已更新</span>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  关注
                </button>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              {/* 收到桃花 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-pink-600 text-2xl">🌸</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">收到桃花</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    「喜欢你的人」是你查看所有<strong className="text-pink-600">给你发送"喜欢"或"桃花"</strong>的地方。
                  </p>
                  
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-pink-600 text-xl mr-3">💝</span>
                      <div>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          任何给你发送桃花的用户，都会<strong className="text-pink-600">完整显示头像与资料</strong>，你可以免费查看并选择是否回赞。
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          这类用户会显示在「喜欢你的人」页面的<strong className="text-pink-600">最上方</strong>。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 收到普通喜欢 */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-2xl">❤️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">收到普通喜欢</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-red-600 text-xl mr-3">👤</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">模糊显示状态</h3>
                          <p className="text-gray-700 leading-relaxed">
                            收到普通"喜欢"的用户，其头像会以<strong className="text-red-600">模糊状态显示</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">💎</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">订阅用户特权</h3>
                          <p className="text-gray-700 leading-relaxed">
                            仅限<strong className="text-blue-600">订阅用户可以立即查看</strong>并与这些用户配对。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🔄</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">免费匹配机会</h3>
                          <p className="text-gray-700 leading-relaxed">
                            不过请放心，这些"喜欢"也会陆续出现在每日的「推荐」页面中，意味着你<strong className="text-green-600">始终可以免费与最匹配的人建立联系</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 订阅用户专属权益 */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-2xl">💎</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">订阅用户在「喜欢你的人」中的专属权益</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    订阅用户不仅可以一次性查看所有喜欢你的人，还可以将这些用户按类别进行筛选，包括：
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">🟢</span>
                          <span className="text-gray-700 font-medium">最近在线</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">📍</span>
                          <span className="text-gray-700 font-medium">附近的人</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">🎯</span>
                          <span className="text-gray-700 font-medium">有共同兴趣</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">⭐</span>
                          <span className="text-gray-700 font-medium">我的类型（基于你在「推荐」中设定的偏好）</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 功能对比 */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 text-2xl">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">功能对比</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🌸 桃花用户</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>完整显示头像和资料</li>
                        <li>免费查看和回赞</li>
                        <li>显示在页面最上方</li>
                        <li>所有用户都可访问</li>
                        <li>表达强烈兴趣</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">❤️ 普通喜欢用户</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>头像模糊显示</li>
                        <li>仅订阅用户可查看</li>
                        <li>显示在页面下方</li>
                        <li>需要订阅权限</li>
                        <li>会出现在推荐中</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 使用建议 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-2xl">💡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">使用建议</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">✅ 推荐做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>优先查看桃花用户</li>
                        <li>及时回应感兴趣的人</li>
                        <li>考虑订阅获得更多功能</li>
                        <li>保持开放和耐心</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">❌ 避免做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>忽视桃花用户的关注</li>
                        <li>过度依赖模糊用户</li>
                        <li>急于做出决定</li>
                        <li>忽略共同兴趣</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 订阅价值 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">🚀</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">订阅的价值</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl">👁️</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">完整查看</h3>
                      <p className="text-gray-700 leading-relaxed">
                        立即查看所有喜欢你的人，不再有模糊头像
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl">🔍</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">智能筛选</h3>
                      <p className="text-gray-700 leading-relaxed">
                        按多种条件筛选，快速找到最合适的人
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl">⚡</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">即时匹配</h3>
                      <p className="text-gray-700 leading-relaxed">
                        无需等待，立即与喜欢你的人建立联系
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