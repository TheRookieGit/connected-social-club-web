'use client'

import { Heart, Gift } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function JoinUs() {
  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">ConnectEd Elite Social Club</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-red-500 transition-colors">
                首页
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-red-500 transition-colors">
                关于我们
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-red-500 transition-colors">
                联系我们
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Come work with us 部分 */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧内容 */}
            <div className="space-y-6">
                           <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
               加入我们
             </h1>
             <p className="text-xl text-gray-600 leading-relaxed">
               我们的使命是给每个人一个爱的机会。你愿意加入吗？
             </p>
             <Link 
               href="#open-roles" 
               className="inline-block text-blue-600 hover:text-blue-700 underline text-lg font-medium transition-colors"
             >
               查看我们的开放职位
             </Link>
            </div>

            {/* 右侧图片 */}
            <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/07020ec6389471bc36ca616bf776ef3e.jpg"
                alt="ConnectEd 团队 - 充满活力的多元化团队"
                fill
                className="object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our perks & benefits 部分 */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Gift className="h-8 w-8 text-purple-500 mr-3" />
                             <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                 我们的福利与待遇
               </h2>
            </div>
          </div>

          {/* 福利列表 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">🏠</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">完全远程工作</h3>
               <p className="text-gray-600">完全远程工作</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">💰</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">具有竞争力的薪酬和股权</h3>
               <p className="text-gray-600">具有竞争力的薪酬和股权</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">⚡</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">灵活的工作环境</h3>
               <p className="text-gray-600">灵活的工作环境</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">📅</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">灵活的带薪休假和病假</h3>
               <p className="text-gray-600">灵活的带薪休假和病假</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">🏥</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">100%覆盖健康、牙科和视力保险</h3>
               <p className="text-gray-600">100%覆盖健康、牙科和视力保险</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">🛡️</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">长期和短期残疾保险</h3>
               <p className="text-gray-600">长期和短期残疾保险</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">💎</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">退休储蓄匹配</h3>
               <p className="text-gray-600">退休储蓄匹配</p>
             </div>

             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="text-3xl mb-4">🎓</div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">年度教育、季度健康检查和月度联合办公空间津贴</h3>
               <p className="text-gray-600">年度教育、季度健康检查和月度联合办公空间津贴</p>
             </div>
          </div>

          {/* 联系我们 */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">准备好加入我们了吗？</h3>
            <p className="text-gray-600 mb-8">发送你的简历到 careers@connected.com</p>
            <Link 
              href="/"
              className="inline-block bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 