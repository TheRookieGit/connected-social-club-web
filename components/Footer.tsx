'use client'

import { Facebook, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 {/* 主要内容区域 */}
         <div className="space-y-12 mb-8">
                       {/* 前两项居中放置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              {/* Working at ConnectEd */}
              <div className="space-y-4 text-center max-w-sm flex flex-col h-full">
                <h3 className="text-2xl font-bold text-gray-900">加入 ConnectEd</h3>
                <p className="text-gray-600 text-base leading-relaxed flex-grow">
                  想要帮助单身人士找到他们正在寻找的认真关系吗？我们很乐意有你加入。
                </p>
                <div className="mt-auto">
                  <Link href="/join-us" className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                    加入我们
                  </Link>
                </div>
              </div>

              {/* ConnectEd in the news */}
              <div className="space-y-4 text-center max-w-sm flex flex-col h-full">
                <h3 className="text-2xl font-bold text-gray-900">ConnectEd 新闻</h3>
                <p className="text-gray-600 text-base leading-relaxed flex-grow">
                  阅读人们的评价，联系我们，或搜索我们ConnectEd公众号。
                </p>
                <div className="mt-auto">
                  <Link href="/news" className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                    查看新闻页面
                  </Link>
                </div>
              </div>
            </div>

                       {/* 关注我们单独一行 */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-bold text-gray-900">关注我们</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Facebook className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.linkedin.com/company/connected-org/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Linkedin className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
         </div>

        {/* 底部导航链接 */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap justify-center space-x-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              关于我们
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              职业机会
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              ConnectEd 情侣
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              帮助中心
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              首页
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              新闻
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              隐私政策
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              服务条款
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 