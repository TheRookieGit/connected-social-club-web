'use client'

import { Heart, Search, Star, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function GettingStarted() {
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
          <span className="text-gray-700">开始使用</span>
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

                 {/* 页面标题 */}
         <div className="text-center mb-12">
           <h1 className="text-4xl font-bold text-gray-900">开始使用</h1>
         </div>

        {/* 文章列表 */}
        <div className="space-y-6">
          {/* 带星标的文章 */}
                     <Link href="/help/getting-started/how-connect-ed-works" className="block">
             <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
               <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
               <div>
                                   <h3 className="text-lg font-semibold text-gray-900 hover:text-red-500 transition-colors">
                    ConnectEd 是如何运作的？
                  </h3>
               </div>
             </div>
           </Link>

          <Link href="/help/getting-started/what-is-connect-ed" className="block">
            <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <Star className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-red-500 transition-colors">
                  什么是 ConnectEd？
                </h3>
              </div>
            </div>
          </Link>

          {/* 普通文章 */}
          <Link href="/help/getting-started/community-guidelines" className="block">
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-500 transition-colors">
                ConnectEd 社区准则
              </h3>
            </div>
          </Link>

          <Link href="/help/getting-started/how-discover-works" className="block">
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-500 transition-colors">
                发现模式是如何运作的？
              </h3>
            </div>
          </Link>

          <Link href="/help/getting-started/how-likes-you-works" className="block">
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-500 transition-colors">
                "喜欢我"功能是如何运作的？
              </h3>
            </div>
          </Link>

          <Link href="/help/getting-started/how-suggested-works" className="block">
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-red-500 transition-colors">
                推荐匹配是如何运作的？
              </h3>
            </div>
          </Link>

          {/* 查看更多链接 */}
          <div className="pt-4 border-t border-gray-200">
            <Link 
              href="/help/getting-started/all"
              className="text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              查看全部 8 篇文章
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 