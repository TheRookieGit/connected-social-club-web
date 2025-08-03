'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowDiscoverWorks() {
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
          <span className="text-gray-700">发现模式是如何运作的？</span>
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
                <Link href="/help/getting-started/how-discover-works" className="block text-red-500 font-medium">
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
                「发现（Discover）」是如何运作的？
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>3个月前</span>
                  <span>已更新</span>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  关注
                </button>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              {/* 功能介绍 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">👀</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">功能介绍</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    「发现」是你可以认识更多每日推荐以外用户的地方。我们建议你先从每天中午推送的「推荐」用户开始浏览，如果想拓展选择，再切换到「发现」页面。
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-blue-600 text-xl mr-3">💡</span>
                      <p className="text-gray-700 leading-relaxed">
                        <strong className="text-blue-600">建议使用顺序</strong>：先浏览每日推荐 → 再探索发现页面
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 筛选搜索 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">开始筛选搜索</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    你可以通过筛选来查找目标对象，筛选项包括：
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">🎓</span>
                          <span className="text-gray-700 font-medium">学历</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">🌍</span>
                          <span className="text-gray-700 font-medium">种族</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">⏰</span>
                          <span className="text-gray-700 font-medium">最近活跃时间</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-orange-600 text-xl mr-3">⚠️</span>
                      <div>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          由于「发现」旨在鼓励探索更多用户，你的筛选条件<strong className="text-orange-600">不会被保存</strong>。
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          关闭 App 或重新打开后需重新设置。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 表达兴趣 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-pink-600 text-2xl">🌸</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">表达兴趣</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-red-600 text-xl mr-3">🚫</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">无法发送普通"喜欢"</h3>
                          <p className="text-gray-700 leading-relaxed">
                            在「发现」页面中无法发送普通的"喜欢"，你需要选择发送桃花来表达兴趣。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-pink-600 text-xl mr-3">💝</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">发送桃花的优势</h3>
                          <p className="text-gray-700 leading-relaxed">
                            发送桃花的用户会立刻出现在对方的「喜欢你的人」页面，<strong className="text-pink-600">大大提高被注意的机会</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-purple-600 text-xl mr-3">💰</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">桃花币购买</h3>
                          <p className="text-gray-700 leading-relaxed">
                            当你发起送出桃花时，系统会提示你使用我们平台的虚拟货币——<strong className="text-purple-600">桃花币</strong>进行购买。
                          </p>
                        </div>
                      </div>
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
                        <li>先浏览每日推荐用户</li>
                        <li>使用筛选功能精确定位</li>
                        <li>发送桃花表达强烈兴趣</li>
                        <li>保持耐心和开放心态</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">❌ 避免做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>跳过每日推荐直接使用发现</li>
                        <li>设置过于严格的筛选条件</li>
                        <li>频繁发送桃花给同一用户</li>
                        <li>期望立即得到回应</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 与推荐功能的区别 */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 text-2xl">🔄</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">与推荐功能的区别</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 每日推荐</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>每天中午推送</li>
                        <li>基于算法匹配</li>
                        <li>可以发送免费"喜欢"</li>
                        <li>筛选条件会被保存</li>
                        <li>优先推荐最匹配的用户</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 发现模式</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>随时可以浏览</li>
                        <li>基于筛选条件</li>
                        <li>只能发送桃花</li>
                        <li>筛选条件不保存</li>
                        <li>探索更多可能性</li>
                      </ul>
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