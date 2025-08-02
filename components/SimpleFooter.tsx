'use client'

import Link from 'next/link'

export default function SimpleFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 底部导航链接 */}
        <div className="flex flex-wrap justify-center space-x-6 text-sm">
          <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            关于我们
          </Link>
          <Link href="/join-us" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            职业机会
          </Link>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            ConnectEd 情侣
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            帮助中心
          </a>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            首页
          </Link>
          <Link href="/news" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            媒体合作
          </Link>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            隐私政策
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
            服务条款
          </a>
        </div>
      </div>
    </footer>
  )
} 