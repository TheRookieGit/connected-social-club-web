'use client'

import { Heart, Shield, Lock, Eye, FileText, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function PrivacyPolicy() {
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

      {/* 主要内容 */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              📜 ConnectEd Elite Social Club 隐私政策
            </h1>
            <p className="text-lg text-gray-600">
              最近更新：2025 年 8 月 3 日
            </p>
          </div>

          {/* 政策内容 */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                本隐私政策（"本政策"）说明了 ConnectEd Elite Social Club（"我们"、"本平台"）收集的信息内容、使用方式、分享对象，以及你就信息使用和披露所拥有的权利和选择。
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                通过使用我们的网站（https://www.connected-elite.com）、移动应用和其他服务（统称"ConnectEd Elite Social Club"），你即表示同意本隐私政策所述的内容。
              </p>
            </div>

            {/* 一、我们收集的信息及方式 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="mr-3 text-red-500" size={24} />
                一、我们收集的信息及方式：
              </h2>
              
                             <div className="space-y-6">
                 <div className="bg-gray-50 rounded-lg p-6">
                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                     📱 自动收集的信息
                   </h3>
                   <p className="text-gray-700 mb-4">
                     我们在你使用本平台时，会自动收集并存储部分设备及使用数据，包括但不限于：
                   </p>
                   <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                     <li>设备唯一标识符（如 IMEI 或广告 ID）</li>
                     <li>地理位置：在你注册或启用定位服务时，我们会在你允许的前提下收集 GPS 信息</li>
                     <li>设备规格与网络信息：包括设备类型、操作系统、浏览器、IP 地址等，用于防欺诈、趋势分析、用户行为追踪</li>
                     <li>使用行为：例如使用时长、使用的功能、你浏览的内容与资料（包括查看过的用户）</li>
                     <li>Cookies 与追踪技术：用于记录访问次数、偏好设置、广告定向等</li>
                     <li>Web Beacons（像素标签）：用于衡量行为数据，比如邮件是否被打开、链接是否被点击等</li>
                   </ul>
                 </div>

                 <div className="bg-gray-50 rounded-lg p-6">
                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                     📂 我们从其他来源获取的信息
                   </h3>
                   <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                     <li>第三方平台授权信息：如通过 Facebook 登录时提供的姓名、邮箱、头像、好友关系等（经你授权）</li>
                     <li>第三方服务商：例如分析工具、广告投放平台、身份验证服务（如 Persona）等</li>
                     <li>其他用户提供的信息：如客服对话中提及的信息等</li>
                   </ul>
                 </div>

                 <div className="bg-gray-50 rounded-lg p-6">
                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                     ✍️ 你主动提供的信息
                   </h3>
                   <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                     <li>个人信息（如邮箱、手机号、生日、性别、性取向）</li>
                     <li>个人资料（照片、学校、职业、城市等）</li>
                     <li>敏感信息（如种族、宗教、政治取向或性取向——提供即表示同意我们用于匹配目的）</li>
                     <li>支付信息（用于认证、订阅或桃花币充值）</li>
                     <li>与其他用户的消息记录</li>
                     <li>推荐朋友时提交的联系信息（仅用于一次性邀请）</li>
                   </ul>
                 </div>
               </div>
            </section>

            {/* 二、我们如何使用你的信息 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="mr-3 text-red-500" size={24} />
                二、我们如何使用你的信息
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们可能基于以下目的处理你的数据：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>实现匹配推荐服务</li>
                  <li>回复你的提问与客服请求</li>
                  <li>推送活动、促销、新闻、产品信息等内容（你可以随时退订）</li>
                  <li>分析用户趋势与行为</li>
                  <li>防止欺诈、确保平台安全</li>
                  <li>运营与优化平台功能与服务</li>
                  <li>出于合法权益目的（如市场研究、法律维权）</li>
                  <li>经你授权或提示的其他用途</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  此外，我们可能会匿名化使用数据用于匹配研究、平台优化、博客发布等用途，但不会公开任何个人身份信息。
                </p>
              </div>
            </section>

            {/* 三、我们如何分享你的信息 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="mr-3 text-red-500" size={24} />
                三、我们如何分享你的信息
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们不会在未经授权的情况下将你的个人信息出售给第三方，但可能在以下场景中共享：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>与其他用户共享你的公开资料，以实现匹配服务</li>
                  <li>与服务提供商和合作伙伴共享（如广告、支付、数据分析）</li>
                  <li>出于法律义务或合并收购等商业变更场景</li>
                  <li>与授权登录使用的第三方平台共享交互信息（如 Facebook 登录）</li>
                  <li>以匿名或去识别化的形式用于平台优化（不适用本隐私政策）</li>
                </ul>
              </div>
            </section>

            {/* 四、账户信息管理与删除 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                四、账户信息管理与删除
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  你可以随时登录账户修改资料，如需删除账户，我们将先停用后彻底清除你的数据。若仍有活跃请求或咨询事项，我们可能会基于服务需要继续与你沟通。
                </p>
              </div>
            </section>

            {/* 五、你的隐私权利 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                五、你的隐私权利（符合适用法律）
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  你可能有如下权利（视所在地区适用法律而定）：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>访问、修改、删除你的个人信息</li>
                  <li>限制或反对我们处理你的信息</li>
                  <li>撤回对我们处理某些数据的同意</li>
                  <li>要求将你的信息传输给其他服务商</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  如需行使上述权利，请通过我们提供的联系方式提交请求，我们将依照法律要求进行处理。
                </p>
              </div>
            </section>

            {/* 六、第三方网站与服务 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                六、第三方网站与服务
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  平台中可能包含指向第三方服务（如社交媒体）的链接，我们不对其隐私政策或行为负责，请自行查阅第三方隐私政策。
                </p>
              </div>
            </section>

            {/* 七、数据保存与销毁 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                七、数据保存与销毁
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  我们会在你使用服务期间或为实现服务目的所需时间内保存你的数据。涉及身份认证或生物特征数据（如照片验证）将由第三方服务商保管，不超过 3 年或法律要求的保留期限。
                </p>
              </div>
            </section>

            {/* 八、信息安全 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                八、信息安全
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  我们采取合理的技术手段保障数据安全，但无法保证 100% 安全。你同意我们可通过电子方式（如站内通知或邮件）向你发送与隐私安全相关的通知。
                </p>
              </div>
            </section>

            {/* 九、你的选择权 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                九、你的选择权
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>可通过浏览器设置禁用 Cookies（可能影响平台功能）</li>
                  <li>可设置不接收营销邮件或短信通知</li>
                  <li>可在移动设备中禁用定位服务或广告追踪（如"限制广告追踪"）</li>
                  <li>目前我们不会响应浏览器的 "Do Not Track" 信号</li>
                </ul>
              </div>
            </section>

            {/* 十、加州居民特别说明 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                十、加州居民特别说明（如适用）
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  我们不会"出售"加州居民的个人信息，也不会对未满 16 岁用户进行销售行为。你有权了解、访问、更正、删除自己的数据，并要求我们披露为第三方营销而分享的信息。
                </p>
              </div>
            </section>

            {/* 十一、国际用户注意事项 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                十一、国际用户注意事项
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  若你在美国以外地区访问平台，可能涉及数据跨境传输。我们将根据适用的跨境数据机制处理你的信息。
                </p>
              </div>
            </section>

            {/* 十二、政策更新 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                十二、政策更新
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  如我们对隐私政策做出重大修改，将通过电子邮件或站内通知告知你，并更新顶部的"最后更新"日期。
                </p>
              </div>
            </section>

            {/* 十三、联系我们 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="mr-3 text-red-500" size={24} />
                十三、联系我们
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  如你对本政策或隐私实践有任何疑问，请通过我们的客服平台提交请求，或邮寄至：
                </p>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ConnectEd Elite Social Club</h3>
                  <div className="flex items-center text-gray-700 mb-2">
                    <MapPin className="mr-2 text-red-500" size={16} />
                    <span>📮 地址：PO Box 470490, San Francisco, CA 94147</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Mail className="mr-2 text-red-500" size={16} />
                    <span>📨 或通过在线客服表单联系</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  )
} 