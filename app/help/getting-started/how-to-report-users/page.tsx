'use client'

import { Heart, Search, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowToReportUsers() {
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
          <Link href="/help/getting-started" className="hover:text-red-500 transition-colors">
            开始使用
          </Link>
          <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
          <span className="text-gray-700">如何举报不当用户？</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">开始使用</h3>
              <div className="space-y-2">
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
          <div className="lg:col-span-3">
            <article className="prose prose-lg max-w-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>8个月前</span>
                  <span>已更新</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">如何举报不当用户？</h1>

              <div className="text-gray-700 leading-relaxed space-y-6">
                <p>
                  在 ConnectEd Elite Social Club，我们致力于维护一个安全、尊重和包容的社区环境。如果您遇到不当行为或违反社区准则的用户，我们鼓励您立即举报。
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">什么情况下应该举报？</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>骚扰、威胁或恐吓行为</li>
                  <li>不当或冒犯性的内容</li>
                  <li>虚假信息或欺诈行为</li>
                  <li>冒充他人或虚假身份</li>
                  <li>垃圾信息或商业推销</li>
                  <li>违反社区准则的其他行为</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">如何举报用户？</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>在聊天界面中，点击右上角的菜单按钮</li>
                  <li>选择"举报用户"选项</li>
                  <li>选择举报原因</li>
                  <li>提供详细描述（可选但建议）</li>
                  <li>提交举报</li>
                </ol>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">举报后会发生什么？</h2>
                <p>
                  我们的安全团队会在24小时内审查您的举报。如果发现违规行为，我们可能会：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>警告该用户</li>
                  <li>暂时或永久封禁账户</li>
                  <li>删除不当内容</li>
                  <li>在严重情况下，向相关执法部门报告</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">保护自己</h2>
                <p>
                  除了举报，您还可以：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>屏蔽不当用户，避免进一步接触</li>
                  <li>保存相关对话截图作为证据</li>
                  <li>不要回应骚扰或威胁信息</li>
                  <li>如果感到威胁，请立即联系当地执法部门</li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
                  <p className="text-blue-800">
                    <strong>重要提示：</strong> 我们严肃对待所有举报，并致力于保护我们社区的安全。您的举报有助于维护 ConnectEd 的友好环境。
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 