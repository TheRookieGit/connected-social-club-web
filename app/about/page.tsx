'use client'

import { Heart, BookOpen, Users, Target } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  return (
    <div className="min-h-screen">
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
              <Link href="/about" className="text-red-500 font-medium">
                关于我们
              </Link>
              <Link href="/join-us" className="text-gray-600 hover:text-red-500 transition-colors">
                加入我们
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 我们的使命 部分 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧内容 */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                我们的使命
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                ConnectEd Foundation 是一家注册于美国加利福尼亚州的非营利组织。我们的使命是促进教育平等，培养下一代学者，帮助来自不同背景的学生在学术界蓬勃发展。
              </p>
              <Link 
                href="#mission-details" 
                className="inline-block text-red-500 hover:text-red-600 underline text-lg font-medium transition-colors"
              >
                了解更多关于我们的工作
              </Link>
            </div>

            {/* 右侧图片 */}
            <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
                             <Image
                 src="/images/35890351d159b989fbf3166589a31837.png"
                 alt="ConnectEd Foundation - 教育平等与学术发展"
                 fill
                 className="object-cover rounded-2xl"
                 priority
               />
            </div>
          </div>
        </div>
      </section>

      {/* 使命详情 部分 */}
      <section id="mission-details" className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              我们的工作方式
            </h2>
          </div>

          {/* 工作方式列表 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">多方合作</h3>
              <p className="text-gray-600">与学生组织和校园项目合作，与知名大学的教授和研究人员协作</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">学术活动</h3>
              <p className="text-gray-600">组织在线讲座、研讨会、访谈和社交活动</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">包容社区</h3>
              <p className="text-gray-600">建立包容、多元和支持性的学术社区</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">打破壁垒</h3>
              <p className="text-gray-600">打破由不利的文化、社会和经济地位造成的无形天花板</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">研究推广</h3>
              <p className="text-gray-600">帮助教授提高研究的可见度，接触有相似研究兴趣的学生</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">🌉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">搭建桥梁</h3>
              <p className="text-gray-600">在学术资源与弱势学生群体之间搭建桥梁</p>
            </div>
          </div>
        </div>
      </section>

      {/* 我们的愿景 部分 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              我们的愿景
            </h2>
          </div>

          {/* 愿景内容 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 shadow-sm">
              <div className="text-center">
                <div className="text-4xl mb-6">✨</div>
                                 <p className="text-lg text-gray-700 leading-relaxed">
                   通过所有这些努力，我们希望确保所有对研究充满热情的学生都能追求自己的梦想，在学术界蓬勃发展。<br />
                   我们致力于为每个有抱负的学者创造平等的机会，让知识的光芒照亮每个人的未来。
                 </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 联系我们 部分 */}
      <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">想要了解更多关于我们的工作吗？</h3>
            <p className="text-gray-600 mb-8">联系我们：admin@connect-edu.org</p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/join-us"
                className="inline-block bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                加入我们
              </Link>
              <Link 
                href="/"
                className="inline-block bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 