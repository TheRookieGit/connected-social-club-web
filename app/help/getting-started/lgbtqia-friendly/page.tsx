'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function LgbtqiaFriendly() {
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
          <span className="text-gray-700">你们的应用对 LGBTQIA+ 友好吗？</span>
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
          <div className="flex-1 max-w-4xl">
            {/* 文章标题和元数据 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ConnectEd Elite Social Club 支持 LGBTQIA+ 群体吗？
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                     <div className="flex items-center space-x-2">
                     <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                       <Heart className="w-4 h-4 text-white" />
                     </div>
                     <span>ConnectEd 团队</span>
                   </div>
                  <span>10个月前</span>
                  <span>已更新</span>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  关注
                </button>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              {/* 支持声明 */}
              <div className="bg-gradient-to-br from-rainbow-50 to-pink-50 border border-rainbow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-rainbow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-rainbow-600 text-2xl">🏳️‍🌈</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">当然支持！</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    ConnectEd Elite Social Club 面向<strong className="text-rainbow-600">所有希望建立真实关系的人</strong>开放，无论性取向如何。
                  </p>
                  
                  <div className="bg-rainbow-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-rainbow-600 text-xl mr-3">💝</span>
                      <p className="text-gray-700 leading-relaxed">
                        与所有用户一样，LGBTQIA+ 群体每天也会收到根据偏好<strong className="text-rainbow-600">精心挑选的潜在匹配对象</strong>。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 当前状况说明 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">当前状况说明</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">🌱</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">持续增长中</h3>
                          <p className="text-gray-700 leading-relaxed">
                            由于我们在 LGBTQIA+ 群体中的用户数量还在<strong className="text-blue-600">持续增长中</strong>，在某些地区可能匹配池相对较小。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🚀</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">积极拓展</h3>
                          <p className="text-gray-700 leading-relaxed">
                            我们正在<strong className="text-green-600">不断努力拓展</strong>这个多元包容的社区，欢迎你加入并成为改变的一部分。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 平台特色 */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-2xl">⭐</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">平台特色</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">🌈</span>
                          <span className="text-gray-700 font-medium">包容性设计</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">💕</span>
                          <span className="text-gray-700 font-medium">真实关系导向</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">🛡️</span>
                          <span className="text-gray-700 font-medium">安全保护</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">🎯</span>
                          <span className="text-gray-700 font-medium">智能匹配</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">🤝</span>
                          <span className="text-gray-700 font-medium">社区支持</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-2">📈</span>
                          <span className="text-gray-700 font-medium">持续发展</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 用户建议 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-2xl">💡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">给 LGBTQIA+ 用户的建议</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">✅ 推荐做法</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>诚实填写个人资料</li>
                        <li>明确表达恋爱目标</li>
                        <li>保持开放和耐心</li>
                        <li>积极参与社区</li>
                        <li>分享使用体验</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">🎯 使用技巧</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>合理设置偏好条件</li>
                        <li>定期更新个人资料</li>
                        <li>主动发起对话</li>
                        <li>关注平台更新</li>
                        <li>邀请朋友加入</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 社区承诺 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">🤝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">我们的承诺</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 text-xl mr-3">🏳️‍🌈</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">平等对待</h3>
                          <p className="text-gray-700 leading-relaxed">
                            我们承诺为所有用户提供<strong className="text-green-600">平等、尊重、包容</strong>的社交环境。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-600 text-xl mr-3">🚀</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">持续改进</h3>
                          <p className="text-gray-700 leading-relaxed">
                            我们将<strong className="text-blue-600">持续改进平台功能</strong>，为 LGBTQIA+ 用户提供更好的体验。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-purple-600 text-xl mr-3">💝</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">真诚服务</h3>
                          <p className="text-gray-700 leading-relaxed">
                            我们致力于帮助<strong className="text-purple-600">每个人找到真爱</strong>，无论性别、性取向或身份认同如何。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 加入邀请 */}
              <div className="bg-gradient-to-br from-rainbow-50 to-pink-50 border border-rainbow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-rainbow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-rainbow-600 text-2xl">🎉</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">加入我们</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    欢迎加入 ConnectEd Elite Social Club，成为我们<strong className="text-rainbow-600">多元包容社区</strong>的一部分！
                  </p>
                  
                  <div className="bg-rainbow-50 rounded-lg p-4">
                    <div className="flex items-center justify-center">
                      <span className="text-rainbow-600 text-xl mr-3">🏳️‍🌈</span>
                      <p className="text-gray-700 leading-relaxed">
                        让我们一起创造一个<strong className="text-rainbow-600">更美好、更包容</strong>的社交环境。
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