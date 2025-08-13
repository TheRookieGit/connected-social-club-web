'use client'

import { Heart, Search, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowToEditProfile() {
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
          <span className="text-gray-700">如何编辑我的个人资料？</span>
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
                  推荐匹配和发现模式有什么区别？
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
                  <span>7个月前</span>
                  <span>已更新</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">如何编辑我的个人资料？</h1>

              <div className="text-gray-700 leading-relaxed space-y-6">
                <p>
                  您的个人资料是展示自己的重要窗口，一个完整、真实的个人资料能大大提高匹配成功率。以下是编辑个人资料的详细步骤。
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">访问个人资料设置</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>打开 ConnectEd 应用</li>
                  <li>点击底部导航栏的"个人资料"图标</li>
                  <li>点击右上角的"编辑"按钮</li>
                  <li>您将进入个人资料编辑页面</li>
                </ol>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">可编辑的个人资料项目</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">基本信息</h4>
                    <ul className="list-disc pl-6 space-y-1 text-blue-800">
                      <li>姓名（可设置显示名称）</li>
                      <li>年龄（注册后不可更改）</li>
                      <li>性别（注册后不可更改）</li>
                      <li>身高</li>
                      <li>体重</li>
                      <li>职业</li>
                      <li>教育背景</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">个人介绍</h4>
                    <ul className="list-disc pl-6 space-y-1 text-green-800">
                      <li>个人简介（最多500字）</li>
                      <li>兴趣爱好</li>
                      <li>生活目标</li>
                      <li>理想伴侣描述</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">照片管理</h4>
                    <ul className="list-disc pl-6 space-y-1 text-purple-800">
                      <li>上传新照片（最多6张）</li>
                      <li>调整照片顺序</li>
                      <li>删除不喜欢的照片</li>
                      <li>设置主照片</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">偏好设置</h4>
                    <ul className="list-disc pl-6 space-y-1 text-orange-800">
                      <li>年龄范围偏好</li>
                      <li>距离范围偏好</li>
                      <li>其他筛选条件</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">编辑技巧和建议</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">个人简介写作技巧</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>保持真实，避免夸大或虚假信息</li>
                      <li>突出您的独特之处和兴趣爱好</li>
                      <li>使用积极、正面的语言</li>
                      <li>避免过于正式或过于随意的语气</li>
                      <li>可以添加一些幽默元素</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">照片选择建议</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>第一张照片应该是最吸引人的</li>
                      <li>包含不同场景和表情的照片</li>
                      <li>确保照片清晰、光线充足</li>
                      <li>避免过度美颜或滤镜</li>
                      <li>展示您的真实生活状态</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">保存和更新</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>完成编辑后，点击"保存"按钮</li>
                  <li>系统会自动更新您的个人资料</li>
                  <li>其他用户将在几分钟内看到更新</li>
                  <li>您可以随时重新编辑个人资料</li>
                </ol>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">注意事项</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <ul className="list-disc pl-6 space-y-2 text-yellow-800">
                    <li>年龄和性别在注册后不可更改，请谨慎填写</li>
                    <li>个人资料内容需符合社区准则</li>
                    <li>不得包含联系方式、社交媒体账号等</li>
                    <li>不得使用他人照片或虚假信息</li>
                    <li>定期更新个人资料，保持活跃度</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
                  <p className="text-blue-800">
                    <strong>小贴士：</strong> 一个完整、真实的个人资料能显著提高您的匹配成功率。建议定期更新个人资料，添加新的照片和内容。
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