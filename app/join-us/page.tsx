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
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
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
               className="inline-block text-red-500 hover:text-red-600 underline text-lg font-medium transition-colors"
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
       <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
               我们的福利与待遇
             </h2>
           </div>

                     {/* 福利列表 */}
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">完全远程工作</h3>
                <p className="text-gray-600">灵活的时间安排，在家办公</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">💝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">志愿服务津贴</h3>
                <p className="text-gray-600">每月志愿服务津贴和交通补贴</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">灵活的工作时间</h3>
                <p className="text-gray-600">根据个人时间安排灵活参与</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">弹性参与制度</h3>
                <p className="text-gray-600">可根据个人情况调整参与频率</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">定期学习机会</h3>
                <p className="text-gray-600">免费参加网课、讲座和培训</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">社区建设</h3>
                <p className="text-gray-600">参与有意义的社会公益活动</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">💎</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">技能发展</h3>
                <p className="text-gray-600">获得专业培训和技能认证</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🌟</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">成就感与认可</h3>
                <p className="text-gray-600">获得志愿服务证书和表彰</p>
              </div>
           </div>

                                          </div>
        </section>

       {/* 我们的价值观 部分 */}
       <section className="bg-white py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
               我们的价值观
             </h2>
           </div>

                       {/* 价值观列表 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                             <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-3xl mb-4">🛡️</div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">责任担当</h3>
                 <p className="text-gray-600">我们努力践行承诺，不仅对彼此负责，也对我们的社区负责。</p>
               </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">协作共赢</h3>
                <p className="text-gray-600">我们不仅庆祝彼此的工作成果，更庆祝每个人的独特价值。</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">持续学习</h3>
                <p className="text-gray-600">我们勇于冒险、实验和反思，以便不断成长进步。</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">坦诚沟通</h3>
                <p className="text-gray-600">我们为诚实反馈和明确边界创造空间。</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">主动担当</h3>
                <p className="text-gray-600">我们通过积极主动、资源丰富和坚持不懈来推动我们想要看到的改变。</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">❤️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">爱心奉献</h3>
                <p className="text-gray-600">我们以爱心和奉献精神服务他人，让世界变得更加美好。</p>
              </div>
                        </div>
          </div>
        </section>

        {/* 联系我们 部分 */}
        <section className="bg-gradient-to-br from-pink-50 to-rose-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">准备好加入我们的志愿者团队了吗？</h3>
              <p className="text-gray-600 mb-8">发送你的申请到 admin@connect-edu.org</p>
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