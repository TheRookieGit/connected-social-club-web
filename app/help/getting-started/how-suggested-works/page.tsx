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
          <span className="text-gray-700">推荐匹配是如何运作的？</span>
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
                「推荐（Suggested）」是如何运作的？
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
              {/* 功能介绍 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">功能介绍</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    每天中午左右，我们会在「推荐」页面为你推送一批个性化的潜在匹配对象。这些人选是根据你的：
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
                        <span className="text-gray-700 font-medium">过往的"喜欢"与"跳过"记录</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-2">💕</span>
                        <span className="text-gray-700 font-medium">双方互相喜欢的可能性</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    等综合因素精挑细选出来的。
                  </p>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-green-600 text-xl mr-3">⏰</span>
                      <p className="text-gray-700 leading-relaxed">
                        你可以查看页面顶部的<strong className="text-green-600">倒计时</strong>，了解距离下一轮推荐还有多久。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 点赞与配对 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-pink-600 text-2xl">❤️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">点赞与配对</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-pink-600 text-xl mr-3">💝</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">免费点赞</h3>
                          <p className="text-gray-700 leading-relaxed">
                            在「推荐」中发送普通"喜欢"是<strong className="text-pink-600">完全免费的</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🔄</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">双向推荐</h3>
                          <p className="text-gray-700 leading-relaxed">
                            当你对某人点赞后，你的资料会很快出现在他们的推荐中，对方也就有机会免费与你配对。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-purple-600 text-xl mr-3">✨</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">即时配对</h3>
                          <p className="text-gray-700 leading-relaxed">
                            有时候，你还会在推荐中看到已经喜欢过你的人！只要你回赞，就可以<strong className="text-purple-600">立即配对成功</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 偏好设置 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">⚙️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">偏好设置</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    点击「推荐」页面右上角进入"偏好设置"，你可以免费设置筛选条件，包括：
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">👥</span>
                          <span className="text-gray-700 font-medium">性别</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">📊</span>
                          <span className="text-gray-700 font-medium">年龄</span>
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
                          <span className="text-green-600 mr-2">🌍</span>
                          <span className="text-gray-700 font-medium">种族</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">🙏</span>
                          <span className="text-gray-700 font-medium">宗教信仰</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">💕</span>
                          <span className="text-gray-700 font-medium">恋爱目标</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-orange-600 text-xl mr-3">⚠️</span>
                      <p className="text-gray-700 leading-relaxed">
                        请注意：这些偏好只适用于「推荐」页面，不会影响「发现」或「喜欢你的人」中的显示内容。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 强硬偏好 */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-2xl">🚫</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">强硬偏好（Dealbreakers）</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">💡</span>
                        <div>
                          <p className="text-gray-700 leading-relaxed">
                            我们将你的偏好视为<strong className="text-blue-600">「倾向」而非「绝对限制」</strong>。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🎯</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">智能推荐示例</h3>
                          <p className="text-gray-700 leading-relaxed">
                            例如：你希望看到 5 英里范围内的用户，但我们发现 7 英里外有个非常适合你的人，我们仍然会向你推荐，以免你错过机会。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-red-600 text-xl mr-3">🔒</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">设置强硬偏好</h3>
                          <p className="text-gray-700 leading-relaxed">
                            当然，如果你对此非常坚持，可以在偏好设置页面底部打开"这是我的硬性条件"选项。只要你设置为"强硬偏好"，我们就绝不会推荐超出该条件的用户。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-orange-600 text-xl mr-3">⚠️</span>
                        <div>
                          <p className="text-gray-700 leading-relaxed">
                            请注意，设置过多强硬偏好可能会<strong className="text-orange-600">显著减少你的推荐池</strong>，从而导致匹配机会减少。
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
                  <h2 className="text-2xl font-bold text-gray-900">订阅用户在「推荐」中的专属权益</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-8">
                    {/* 高级偏好筛选 */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">高级偏好筛选</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        订阅用户可以解锁额外的「高级偏好」，包括：
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">📏</span>
                              <span className="text-gray-700 font-medium">身高</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">🎓</span>
                              <span className="text-gray-700 font-medium">学历</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">👨‍👩‍👧‍👦</span>
                              <span className="text-gray-700 font-medium">是否计划成家</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">👶</span>
                              <span className="text-gray-700 font-medium">是否有小孩</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">💍</span>
                              <span className="text-gray-700 font-medium">婚姻状态</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">🚬</span>
                              <span className="text-gray-700 font-medium">是否吸烟</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">🍷</span>
                              <span className="text-gray-700 font-medium">是否饮酒</span>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <span className="text-purple-600 mr-2">💪</span>
                              <span className="text-gray-700 font-medium">是否健身等</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 赠送桃花功能 */}
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-pink-600 text-xl mr-3">🌸</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">赠送桃花功能</h3>
                          <p className="text-gray-700 leading-relaxed">
                            某些订阅计划包含每月免费桃花。你可以用桃花代替普通的"喜欢"来表达更强烈的兴趣，从而<strong className="text-pink-600">更容易脱颖而出并更快被注意到</strong>。
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
                        <li>每天查看推荐页面</li>
                        <li>合理设置偏好条件</li>
                        <li>及时回应感兴趣的人</li>
                        <li>保持开放心态</li>
                        <li>考虑订阅获得更多功能</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">❌ 避免做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>设置过多强硬偏好</li>
                        <li>忽视推荐页面</li>
                        <li>过于挑剔</li>
                        <li>错过倒计时提醒</li>
                        <li>忽略已经喜欢你的人</li>
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