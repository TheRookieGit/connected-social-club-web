'use client'

import { Heart, Search, ChevronLeft, User, Calendar, Star } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function HowConnectEdWorks() {
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
                     <span className="text-gray-700">ConnectEd 是如何运作的？</span>
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
                                 <Link href="/help/getting-started/how-connect-ed-works" className="block text-red-500 font-medium">
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
                ConnectEd Elite Social Club 是如何运作的？
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span>ConnectEd 团队</span>
                  </div>
                  <span>6个月前</span>
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
                   ConnectEd Elite Social Club 是为<strong className="text-pink-600">认真寻求恋爱关系的用户</strong>设计的平台，因此其运行方式与一般的交友应用有所不同。
                 </p>
               </div>

                             {/* 核心功能介绍 */}
               <div className="grid md:grid-cols-2 gap-6 mb-8">
                 {/* 每日推荐 */}
                 <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center mb-4">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                       <span className="text-blue-600 text-xl">📅</span>
                     </div>
                     <h2 className="text-xl font-bold text-gray-900">每天中午推送匹配对象</h2>
                   </div>
                   <p className="text-gray-700 leading-relaxed mb-3">
                     每天中午，我们会为你推荐一批与你最匹配的潜在对象。你可以<strong className="text-blue-600">免费选择"喜欢"或"跳过"</strong>，如果彼此互相喜欢，就会<strong className="text-blue-600">配对成功并立刻开启聊天</strong>！
                   </p>
                   <p className="text-gray-700 leading-relaxed mb-3">
                     符合你偏好的"喜欢"会陆续显示在 <strong className="text-blue-600">「推荐」</strong> 页面中。如果你不想等待，也可以订阅 <strong className="text-blue-600">「喜欢你的人」</strong> 功能，<strong className="text-blue-600">立即查看所有对你感兴趣的人</strong>。
                   </p>
                   <p className="text-gray-700 leading-relaxed">
                     当有人送你「<strong className="text-pink-600">桃花</strong>」（我们平台表达"超级感兴趣"的方式）时，你也可以<strong className="text-blue-600">在「喜欢你的人」中免费看到他们的完整资料</strong>。
                   </p>
                 </div>

                 {/* 发现功能 */}
                 <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center mb-4">
                     <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                       <span className="text-purple-600 text-xl">🌟</span>
                     </div>
                     <h2 className="text-xl font-bold text-gray-900">想认识更多人？</h2>
                   </div>
                   <p className="text-gray-700 leading-relaxed mb-3">
                     可以进入 <strong className="text-purple-600">「发现」</strong> 页面，在这里你可以浏览更多用户资料，并<strong className="text-purple-600">发送桃花来脱颖而出</strong>，对方会立刻在「喜欢你的人」中看到你。
                   </p>
                   <p className="text-gray-700 leading-relaxed">
                     桃花需要使用我们平台的虚拟货币「<strong className="text-pink-600">桃花币</strong>」进行购买。
                   </p>
                 </div>
               </div>

               {/* 温馨提示 */}
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                 <div className="flex items-start">
                   <span className="text-yellow-600 text-xl mr-3">💡</span>
                   <p className="text-gray-700 leading-relaxed">
                     功能可能有点多，但别担心——你很快就会习惯！继续往下阅读，了解每个板块的具体使用方式和建议。
                   </p>
                 </div>
               </div>

                             {/* 推荐功能详解 */}
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                 <div className="flex items-center mb-6">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                     <span className="text-blue-600 text-2xl">🙋‍♀️</span>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">一、「推荐」功能详解</h2>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                   {/* 左侧：基本功能 */}
                   <div className="space-y-6">
                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-green-600 text-xl mr-2">✅</span>
                         <h3 className="text-lg font-semibold text-gray-900">使用方式</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed mb-2">
                         每天中午，我们会根据你的偏好、过往的喜欢与跳过记录，以及你们互相喜欢的可能性，为你个性化推荐一批潜在匹配对象。
                       </p>
                       <p className="text-gray-700 leading-relaxed">
                         页面顶部会有倒计时，显示距离下一次推荐还有多久。
                       </p>
                     </div>

                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-red-600 text-xl mr-2">❤️</span>
                         <h3 className="text-lg font-semibold text-gray-900">点赞与配对</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed mb-2">
                         在「推荐」中发送普通"喜欢"是免费的。当你点赞某人后，你会出现在他们的推荐中，对方有机会免费与你配对。
                       </p>
                       <p className="text-gray-700 leading-relaxed">
                         有时候，你也会看到那些<strong className="text-red-600">已经喜欢你的人</strong>，你只需回赞，就能<strong className="text-red-600">立即配对成功</strong>。
                       </p>
                     </div>
                   </div>

                   {/* 右侧：设置和权益 */}
                   <div className="space-y-6">
                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-blue-600 text-xl mr-2">⚙️</span>
                         <h3 className="text-lg font-semibold text-gray-900">设置偏好</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed mb-2">
                         点击「推荐」页面右上角图标进入偏好设置，你可以<strong className="text-blue-600">免费设置筛选条件</strong>，包括性别、年龄、距离、种族、宗教和恋爱目标。
                       </p>
                       <p className="text-gray-700 leading-relaxed">
                         注意：这些偏好<strong className="text-blue-600">仅适用于「推荐」板块</strong>，不会影响「发现」或「喜欢你的人」页面。
                       </p>
                     </div>

                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-purple-600 text-xl mr-2">💎</span>
                         <h3 className="text-lg font-semibold text-gray-900">订阅用户专属权益</h3>
                       </div>
                       <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                         <li><strong className="text-purple-600">高级偏好设置</strong>：订阅用户可以设置更详细的偏好，如：身高、学历、是否计划成家、有无子女、婚姻状况、是否吸烟/饮酒、锻炼频率等。</li>
                         <li><strong className="text-purple-600">赠送桃花</strong>：部分订阅计划包含<strong className="text-purple-600">每月免费桃花</strong>，你可以用桃花代替普通"喜欢"来提升曝光，更容易被看到。</li>
                       </ul>
                     </div>
                   </div>
                 </div>

                 {/* 强硬偏好警告 */}
                 <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                   <div className="flex items-start">
                     <span className="text-orange-600 text-xl mr-3">🚫</span>
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-2">强硬偏好（Dealbreakers）</h3>
                       <p className="text-gray-700 leading-relaxed mb-2">
                         我们会将你的偏好理解为"倾向"而非"绝对限制"。例如，如果你设定了5英里内，但我们发现7英里外有一个很合适的人，还是可能会推荐给你。
                       </p>
                       <p className="text-gray-700 leading-relaxed mb-2">
                         但如果你非常坚持，可以在偏好页面底部打开<strong className="text-orange-600">"这是硬性条件"</strong>开关，这样我们<strong className="text-orange-600">就不会推荐任何不符合这个条件的人</strong>。
                       </p>
                       <p className="text-gray-700 leading-relaxed">
                         ⚠️ 请注意，设定太多硬性条件可能会<strong className="text-orange-600">大幅减少你的推荐池</strong>，长期来看你能看到的人也会变少。
                       </p>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* 喜欢你的人功能详解 */}
               <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                 <div className="flex items-center mb-6">
                   <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                     <span className="text-purple-600 text-2xl">💜</span>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">二、「喜欢你的人」功能详解</h2>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                   {/* 左侧：基本功能 */}
                   <div className="space-y-6">
                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-pink-600 text-xl mr-2">🌸</span>
                         <h3 className="text-lg font-semibold text-gray-900">收到桃花</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed">
                         在「喜欢你的人」中，你可以查看所有对你感兴趣的人，包括送你桃花的用户。这些用户会<strong className="text-pink-600">完整显示头像与资料，且可以免费查看与回赞</strong>。
                       </p>
                     </div>

                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-red-600 text-xl mr-2">❤️</span>
                         <h3 className="text-lg font-semibold text-gray-900">收到普通喜欢</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed">
                         收到的普通喜欢会显示为<strong className="text-red-600">模糊头像</strong>。仅订阅用户可查看这些模糊用户并与之配对。但这些人也会陆续出现在「推荐」中，你<strong className="text-red-600">始终可以免费与最合适的用户配对</strong>。
                       </p>
                     </div>
                   </div>

                   {/* 右侧：订阅权益 */}
                   <div className="bg-white rounded-lg p-4 shadow-sm">
                     <div className="flex items-center mb-3">
                       <span className="text-purple-600 text-xl mr-2">💎</span>
                       <h3 className="text-lg font-semibold text-gray-900">订阅用户权益</h3>
                     </div>
                     <p className="text-gray-700 leading-relaxed mb-4">
                       除了可以一次性查看所有喜欢你的人外，订阅用户还可以根据不同类别筛选：
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                       <div className="bg-purple-50 rounded-lg p-3">
                         <div className="flex items-center">
                           <span className="text-purple-600 text-sm mr-2">🟢</span>
                           <span className="text-sm font-medium text-gray-700">最近在线</span>
                         </div>
                       </div>
                       <div className="bg-purple-50 rounded-lg p-3">
                         <div className="flex items-center">
                           <span className="text-purple-600 text-sm mr-2">📍</span>
                           <span className="text-sm font-medium text-gray-700">附近的人</span>
                         </div>
                       </div>
                       <div className="bg-purple-50 rounded-lg p-3">
                         <div className="flex items-center">
                           <span className="text-purple-600 text-sm mr-2">🎯</span>
                           <span className="text-sm font-medium text-gray-700">有共同兴趣的人</span>
                         </div>
                       </div>
                       <div className="bg-purple-50 rounded-lg p-3">
                         <div className="flex items-center">
                           <span className="text-purple-600 text-sm mr-2">⭐</span>
                           <span className="text-sm font-medium text-gray-700">我的类型</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* 发现功能详解 */}
               <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
                 <div className="flex items-center mb-6">
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                     <span className="text-green-600 text-2xl">🔍</span>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">三、「发现」功能详解</h2>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                   {/* 左侧：基本功能 */}
                   <div className="space-y-6">
                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-green-600 text-xl mr-2">🔍</span>
                         <h3 className="text-lg font-semibold text-gray-900">功能介绍</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed">
                         如果你希望探索更多对象，「发现」页面就是你的好帮手。建议你<strong className="text-green-600">先浏览每日推荐，再来这里拓展可能性</strong>。
                       </p>
                     </div>

                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-green-600 text-xl mr-2">📍</span>
                         <h3 className="text-lg font-semibold text-gray-900">筛选功能</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed">
                         你可以使用多种筛选条件（如年龄、身高、距离、学历、种族、最近活跃时间等）来查找对象。但注意：<strong className="text-green-600">这些搜索不会保存</strong>，每次打开 App 都需要重新设置。
                       </p>
                     </div>
                   </div>

                   {/* 右侧：表达兴趣和权益 */}
                   <div className="space-y-6">
                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-pink-600 text-xl mr-2">🌸</span>
                         <h3 className="text-lg font-semibold text-gray-900">表达兴趣</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed mb-2">
                         在「发现」页面无法发送普通喜欢，你可以选择<strong className="text-pink-600">发送桃花</strong>来表示更强的兴趣。
                       </p>
                       <p className="text-gray-700 leading-relaxed">
                         <strong className="text-pink-600">桃花会让你立刻出现在对方的「喜欢你的人」页面中</strong>。系统会提示你使用「桃花币」购买桃花。
                       </p>
                     </div>

                     <div className="bg-white rounded-lg p-4 shadow-sm">
                       <div className="flex items-center mb-3">
                         <span className="text-purple-600 text-xl mr-2">💎</span>
                         <h3 className="text-lg font-semibold text-gray-900">订阅用户权益</h3>
                       </div>
                       <p className="text-gray-700 leading-relaxed">
                         与「推荐」一样，订阅用户可优先使用订阅赠送的<strong className="text-purple-600">免费桃花</strong>，不需额外购买。
                       </p>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* 聊天功能详解 */}
               <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 mb-8">
                 <div className="flex items-center mb-6">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                     <span className="text-blue-600 text-2xl">💬</span>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">四、「聊天」功能详解</h2>
                 </div>

                 <div className="bg-white rounded-lg p-6 shadow-sm">
                   <p className="text-gray-700 leading-relaxed mb-4">
                     当你和某人<strong className="text-blue-600">互相喜欢并配对成功</strong>后，就可以在「聊天」页面中免费开始聊天。
                   </p>
                   <div className="bg-blue-50 rounded-lg p-4">
                     <div className="flex items-center mb-2">
                       <span className="text-blue-600 text-lg mr-2">⏰</span>
                       <span className="font-semibold text-gray-900">聊天有效期</span>
                     </div>
                     <p className="text-gray-700 leading-relaxed">
                       初始聊天有效期为<strong className="text-blue-600">7天</strong>，只要聊天持续互动，就不会关闭。如果聊天结束，也可以使用「桃花币」重新开启对话。
                     </p>
                   </div>
                 </div>
               </div>

               {/* 桃花币详解 */}
               <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 mb-8">
                 <div className="flex items-center mb-6">
                   <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                     <span className="text-pink-600 text-2xl">🌸</span>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">五、「桃花币」是什么？</h2>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                   {/* 左侧：用途 */}
                   <div className="bg-white rounded-lg p-4 shadow-sm">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3">用途</h3>
                     <p className="text-gray-700 leading-relaxed mb-4">
                       「桃花币」是 ConnectEd Elite Social Club 的<strong className="text-pink-600">虚拟货币</strong>，可用于：
                     </p>
                     <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                       <li>购买桃花</li>
                       <li>提升个人资料曝光度（Boost）</li>
                     </ul>
                   </div>

                   {/* 右侧：获取方式 */}
                   <div className="bg-white rounded-lg p-4 shadow-sm">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3">获取方式</h3>
                     <p className="text-gray-700 leading-relaxed mb-4">
                       你可以通过以下方式<strong className="text-pink-600">获取免费桃花币</strong>：
                     </p>
                     <div className="space-y-2">
                       <div className="flex items-center">
                         <span className="text-pink-600 mr-2">🎁</span>
                         <span className="text-gray-700">第一次登录</span>
                       </div>
                       <div className="flex items-center">
                         <span className="text-pink-600 mr-2">💝</span>
                         <span className="text-gray-700">与推荐用户互动</span>
                       </div>
                       <div className="flex items-center">
                         <span className="text-pink-600 mr-2">📱</span>
                         <span className="text-gray-700">在商店页面关注我们的社交账号等</span>
                       </div>
                     </div>
                     <p className="text-gray-700 leading-relaxed mt-4">
                       当然，也可以在「商店」中购买不同的桃花币礼包。
                     </p>
                   </div>
                 </div>
               </div>

               {/* 订阅说明 */}
               <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-8">
                 <div className="flex items-center mb-6">
                   <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                     <span className="text-purple-600 text-2xl">💓</span>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">六、订阅是如何运作的？</h2>
                 </div>

                 <div className="bg-white rounded-lg p-6 shadow-sm">
                   <div className="mb-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3">我们的理念</h3>
                     <p className="text-gray-700 leading-relaxed">
                       我们的理念是：<strong className="text-purple-600">让每个人都能有机会遇见真正的伴侣</strong>，因此你永远<strong className="text-purple-600">不必为了配对而强制付费</strong>。
                     </p>
                   </div>

                   <div className="mb-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3">订阅优势</h3>
                     <p className="text-gray-700 leading-relaxed">
                       不过，如果你希望提升效率，或者想拥有更多控制权，那么订阅将会是个不错的选择。
                     </p>
                   </div>

                                        <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">了解更多</h3>
                       <p className="text-gray-700 leading-relaxed mb-4">
                         订阅内容和权益可能会随时间更新，最新的内容可以在以下了解：
                       </p>
                     <div className="grid md:grid-cols-2 gap-4">
                       <div className="bg-purple-50 rounded-lg p-3">
                         <div className="flex items-center">
                           <span className="text-purple-600 mr-2">🛍️</span>
                           <span className="text-gray-700">商店（Shop）</span>
                         </div>
                       </div>
                       <div className="bg-purple-50 rounded-lg p-3">
                         <div className="flex items-center">
                           <span className="text-purple-600 mr-2">👤</span>
                           <span className="text-gray-700">个人头像</span>
                         </div>
                       </div>
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