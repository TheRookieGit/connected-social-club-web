'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowAlgorithmWorks() {
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
          <span className="text-gray-700">你们的算法是如何运作的？</span>
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
                <Link href="/help/getting-started/how-suggested-works" className="block text-gray-600 hover:text-red-500 transition-colors">
                  推荐匹配和发现模式有什么区别？
                </Link>
                <Link href="/help/getting-started/how-algorithm-works" className="block text-red-500 font-medium">
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
                ConnectEd Elite Social Club 的匹配算法是如何运作的？
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
              {/* 算法概述 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">智能匹配算法</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    我们的智能匹配算法会<strong className="text-blue-600">不断学习你的偏好和理想类型</strong>！它会综合考虑以下因素：
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <span className="text-blue-600 text-xl mr-3">⚙️</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">具体偏好设置</h3>
                            <p className="text-gray-700 leading-relaxed">
                              你设置的具体偏好（如年龄、距离、种族等）
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <span className="text-green-600 text-xl mr-3">📊</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">行为模式分析</h3>
                            <p className="text-gray-700 leading-relaxed">
                              你对哪些人点击"喜欢"或"跳过"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <span className="text-purple-600 text-xl mr-3">📍</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">地理位置因素</h3>
                            <p className="text-gray-700 leading-relaxed">
                              你所在地区当前的活跃用户
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-pink-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <span className="text-pink-600 text-xl mr-3">💕</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">双向匹配潜力</h3>
                            <p className="text-gray-700 leading-relaxed">
                              更重要的是：你是否也是别人的"理想型"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 学习与优化 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">📈</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">持续学习与优化</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🎯</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">精准推荐</h3>
                          <p className="text-gray-700 leading-relaxed">
                            通过持续学习与优化，我们的算法致力于为你推荐<strong className="text-green-600">最有可能双向匹配、关系潜力更高</strong>的对象。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">🔄</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">算法进化</h3>
                          <p className="text-gray-700 leading-relaxed">
                            匹配越多，算法对你的了解也会<strong className="text-blue-600">越精准</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 算法工作原理 */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-2xl">⚡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">算法工作原理</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-purple-600 text-2xl">📝</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">数据收集</h3>
                      <p className="text-gray-700 leading-relaxed">
                        收集你的偏好设置、行为模式和互动历史
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-purple-600 text-2xl">🧮</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">智能分析</h3>
                      <p className="text-gray-700 leading-relaxed">
                        分析用户间的匹配度和双向兴趣可能性
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-purple-600 text-2xl">🎁</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">精准推荐</h3>
                      <p className="text-gray-700 leading-relaxed">
                        为你推送最有可能成功的匹配对象
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 算法优势 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-2xl">⭐</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">算法优势</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">✅ 我们的优势</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>基于真实行为数据学习</li>
                        <li>考虑双向匹配可能性</li>
                        <li>持续优化推荐精度</li>
                        <li>个性化匹配策略</li>
                        <li>地理位置智能筛选</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">🎯 匹配目标</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>提高匹配成功率</li>
                        <li>减少无效互动</li>
                        <li>促进深度交流</li>
                        <li>建立长期关系</li>
                        <li>提升用户体验</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 隐私保护 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">隐私保护</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">🛡️</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">数据安全</h3>
                          <p className="text-gray-700 leading-relaxed">
                            我们严格保护你的个人信息，算法学习过程完全匿名化，不会泄露你的隐私。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🎛️</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">用户控制</h3>
                          <p className="text-gray-700 leading-relaxed">
                            你可以随时调整偏好设置，控制算法为你推荐的内容类型。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 使用建议 */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 text-2xl">💡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">使用建议</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">✅ 推荐做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>诚实设置偏好条件</li>
                        <li>积极互动和反馈</li>
                        <li>保持开放心态</li>
                        <li>定期更新个人资料</li>
                        <li>耐心等待算法学习</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">❌ 避免做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>设置过于严格的偏好</li>
                        <li>频繁更改偏好设置</li>
                        <li>忽视推荐内容</li>
                        <li>期望立即完美匹配</li>
                        <li>提供虚假信息</li>
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