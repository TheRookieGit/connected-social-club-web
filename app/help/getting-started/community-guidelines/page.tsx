'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function CommunityGuidelines() {
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
          <span className="text-gray-700">ConnectEd 社区准则</span>
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
                <Link href="/help/getting-started/community-guidelines" className="block text-red-500 font-medium">
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
                ConnectEd Elite Social Club 社区行为准则
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>3个月前</span>
                  <span>已更新</span>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  关注
                </button>
              </div>
            </div>

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              {/* 引言部分 */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-pink-400 p-6 rounded-r-lg mb-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  ConnectEd Elite Social Club 是一个<strong className="text-pink-600">安全空间</strong>，我们希望会员在这里可以真诚地展示自我，建立真实的情感连接。为了保障社区成员的安全与隐私，我们请所有用户遵守以下行为准则，以及《隐私政策》和《服务条款》。
                </p>
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-red-600 text-xl mr-3">⚠️</span>
                    <p className="text-gray-700 leading-relaxed">
                      如有用户违反这些准则，可能会被<strong className="text-red-600">永久封禁</strong>。
                    </p>
                  </div>
                </div>
              </div>

              {/* 尊重所有用户 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">🤝</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">尊重所有 ConnectEd 用户</h2>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    ConnectEd 是一个多元、包容的社区，成员来自不同背景，拥有不同的信仰与兴趣，但每个人都应该在这里感到安全、自在地做自己。请保持<strong className="text-blue-600">尊重、诚实、善意</strong>，做到真诚沟通、信守承诺（不要"消失"或"已读不回"）。
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    我们对辱骂行为和仇恨言论采取<strong className="text-blue-600">零容忍政策</strong>，包括针对其他用户或 ConnectEd 员工的行为。遇到不遵守社区准则的用户，请立即举报。
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">辱骂行为包括：</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>欺凌、骚扰</li>
                        <li>发送未请求的性内容</li>
                        <li>跟踪、威胁、恐吓等行为</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">仇恨言论包括：</h3>
                      <p className="text-gray-700 leading-relaxed">
                        任何煽动种族主义、性别歧视、仇恨或暴力的内容，无论是基于宗教、性别、身份或其他因素。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 照片规范 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">📸</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">照片规范</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      至少一张照片需清晰展示你的面部。照片越多、越真实，配对几率就越高（微笑会加分哦）。
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">✅ 允许的内容</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>清晰展示面部的照片</li>
                        <li>真实、自然的微笑照片</li>
                        <li>本人拥有版权的照片</li>
                        <li>儿童与成人同框且穿着整齐</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">❌ 禁止的内容</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>非本人拥有版权的照片</li>
                        <li>色情图片</li>
                        <li>展示枪支</li>
                        <li>涉及违法行为的照片</li>
                        <li>裸照或仅穿内衣的照片</li>
                        <li>血腥、暴力画面</li>
                        <li>含有个人信息的图片</li>
                        <li>AI生成图像或深度伪造照片</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-orange-600 text-xl mr-3">⚠️</span>
                      <p className="text-gray-700 leading-relaxed">
                        如不遵守照片规范，账号将无法通过审核。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 做真实的自己 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-2xl">✨</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">做真实的自己</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    人们想认识真实的你，请不要伪装成别人。
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ 请做到：</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>如实填写个人资料</li>
                        <li>只上传真实本人照片</li>
                        <li>保持真诚的交流态度</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">❌ 禁止行为：</h3>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>创建虚假账户或多个账户</li>
                        <li>反复删除/重建账号</li>
                        <li>冒充他人、使用商标/虚构角色名称</li>
                        <li>谎报年龄、误导他人与他人的关系</li>
                        <li>使用 AI 或 Deepfake 内容误导他人</li>
                        <li>在未获得伴侣同意的情况下使用平台</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-purple-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-purple-600 text-xl mr-3">💡</span>
                      <p className="text-gray-700 leading-relaxed">
                        ConnectEd 提倡真实，信任始于真诚。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 有礼貌的交流 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-2xl">😊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">做一个有礼貌的人</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    请你在视频或线上聊天中展现和现实中一样的素养。如果你不会当面对同事或朋友说出某句话，那也不要对 ConnectEd 的用户说。
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    请用心了解你的匹配对象，发送真诚、适当的信息。避免机械式的开场白，尝试用更贴近对方资料的内容打招呼，这样更容易建立真实对话。
                  </p>
                </div>
              </div>

              {/* 隐私保护 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl">🔒</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">我们重视你的隐私</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    无论是你的隐私，还是他人的隐私，请不要随意共享。这也是为了保护你自己，防止诈骗分子或不良用户利用你的信息。
                  </p>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">禁止上传或分享包括但不限于：</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>密码</li>
                        <li>银行账号</li>
                        <li>护照信息</li>
                      </ul>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>社会安全号码（SSN）</li>
                        <li>其他敏感个人信息</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 平台用途 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-2xl">💕</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">ConnectEd 是为了恋爱，不是做生意</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    这个平台是为了帮助人们建立长期关系，不是用来销售、推广产品或服务的。
                  </p>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">禁止行为：</h3>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                      <li>向他人索要金钱、礼物或其他物品</li>
                      <li>分享支付信息（如 Amazon 心愿单、PayPal、Venmo 等）</li>
                      <li>将平台用于非恋爱目的</li>
                    </ul>
                    <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
                      <p className="text-red-800 font-medium">
                        如果你将平台用于非恋爱目的，我们会永久封禁账号。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 违法行为 */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-2xl">🚫</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">非法的，就是禁止的</h2>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    ConnectEd 对任何违法行为都零容忍，包括但不限于：
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                      <li>非法性行为</li>
                      <li>吸毒或贩毒</li>
                      <li>欺诈</li>
                    </ul>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                      <li>威胁、虐待他人等</li>
                      <li>其他违法行为</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 其他重要规定 */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-gray-600 text-2xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">其他重要规定</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">请勿恶意举报他人</h3>
                    <p className="text-gray-700 leading-relaxed">
                      我们知道并非所有人都符合你的偏好，但请不要因为个人不喜欢就恶意举报对方。如果你不想再看到某人，可以使用"隐藏"或"取消匹配"功能。
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">请勿发送垃圾信息或进行诈骗</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      我们禁止任何试图在平台内进行垃圾营销或诈骗的行为。这包括：
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                      <li>用假身份套取他人隐私</li>
                      <li>在资料中添加其他网站链接</li>
                      <li>发送欺诈性内容</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">禁止传播淫秽、粗俗、血腥、暴力内容</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      未经对方同意分享不适当内容属于骚扰。如果你不会在公开场合分享，就请不要在线上分享。
                    </p>
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-900 mb-2">禁止内容包括：</h4>
                      <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                        <li>色情或攻击性图片</li>
                        <li>不请自来的挑逗、骚扰信息</li>
                        <li>自残、自虐等负面画面</li>
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