'use client'

import { Heart, FileText, Shield, Users, Globe, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import SimpleFooter from '@/components/SimpleFooter'

export default function TermsOfService() {
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
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
                         <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
               <div>📋 ConnectEd Elite Social Club</div>
               <div>服务条款</div>
             </h1>
            <p className="text-lg text-gray-600">
              最后更新日期：2025年8月3日
            </p>
          </div>

          {/* 条款内容 */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                本服务条款（"条款"）是您与 ConnectEd Elite Social Club（"我们"、"本平台"）之间就使用我们的网站、移动应用程序以及相关服务（统称为"服务"）所达成的协议。
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                通过访问或使用我们的服务，您确认已阅读、理解并同意遵守这些条款。如果您不同意这些条款的任何部分，请不要使用我们的服务。
              </p>
            </div>

            {/* 一、服务描述 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-3 text-red-500" size={24} />
                一、服务描述
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  ConnectEd Elite Social Club 是一个社交交友平台，旨在帮助用户建立有意义的联系和关系。我们的服务包括但不限于：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>用户资料创建和管理</li>
                  <li>智能匹配推荐系统</li>
                  <li>即时通讯功能</li>
                  <li>活动组织和参与</li>
                  <li>社区互动功能</li>
                </ul>
              </div>
            </section>

            {/* 二、用户资格 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="mr-3 text-red-500" size={24} />
                二、用户资格
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  要使用我们的服务，您必须：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>年满18周岁或达到您所在地区的法定成年年龄</li>
                  <li>具有完全民事行为能力</li>
                  <li>提供真实、准确、完整的注册信息</li>
                  <li>遵守所有适用的法律法规</li>
                  <li>不得为商业目的使用我们的服务</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  我们保留拒绝服务、终止账户或删除内容的权利，恕不另行通知。
                </p>
              </div>
            </section>

            {/* 三、用户行为准则 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                三、用户行为准则
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  在使用我们的服务时，您同意：
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ 允许的行为：</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>尊重其他用户，保持礼貌和友善</li>
                      <li>提供真实、准确的个人信息</li>
                      <li>保护您的账户安全</li>
                      <li>遵守社区指导原则</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">❌ 禁止的行为：</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>发布虚假、误导或欺诈性信息</li>
                      <li>骚扰、威胁或恐吓其他用户</li>
                      <li>发布色情、暴力或不当内容</li>
                      <li>冒充他人或虚假陈述身份</li>
                      <li>传播病毒、恶意软件或有害代码</li>
                      <li>未经授权访问或干扰我们的系统</li>
                      <li>违反任何适用的法律法规</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 四、隐私和数据保护 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                四、隐私和数据保护
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们重视您的隐私。我们收集、使用和保护您的个人信息的方式在我们的隐私政策中有详细说明。
                </p>
                <p className="text-gray-700 mb-4">
                  通过使用我们的服务，您同意我们按照隐私政策收集和使用您的信息。
                </p>
                <p className="text-gray-700">
                  我们采取合理的安全措施保护您的数据，但无法保证100%的安全性。您有责任保护您的账户信息。
                </p>
              </div>
            </section>

            {/* 五、知识产权 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                五、知识产权
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们的服务及其内容（包括但不限于文本、图形、徽标、图标、图像、音频剪辑、数字下载和软件）均受版权、商标和其他知识产权法保护。
                </p>
                <p className="text-gray-700 mb-4">
                  您保留对您上传到我们平台的内容的所有权，但您授予我们非独占、免版税、可转让的许可，允许我们使用、复制、修改和分发您的内容。
                </p>
                <p className="text-gray-700">
                  未经我们明确书面许可，您不得复制、分发、修改或创建我们内容的衍生作品。
                </p>
              </div>
            </section>

            {/* 六、免责声明 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                六、免责声明
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们的服务按"现状"提供，不提供任何明示或暗示的保证。我们不保证：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>服务将无中断或错误</li>
                  <li>服务将满足您的特定需求</li>
                  <li>服务将安全或无病毒</li>
                  <li>服务中的信息将准确或完整</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  我们不对因使用我们的服务而产生的任何直接、间接、偶然、特殊或后果性损害承担责任。
                </p>
              </div>
            </section>

            {/* 七、责任限制 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                七、责任限制
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  在法律允许的最大范围内，我们的总责任不超过您在过去12个月内为使用我们的服务而支付的金额。
                </p>
                <p className="text-gray-700">
                  某些司法管辖区不允许排除或限制某些类型的损害，因此上述限制可能不适用于您。
                </p>
              </div>
            </section>

            {/* 八、服务变更和终止 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                八、服务变更和终止
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们保留随时修改、暂停或终止服务的权利，恕不另行通知。我们不对任何服务中断承担责任。
                </p>
                <p className="text-gray-700 mb-4">
                  您可以在任何时候停止使用我们的服务。我们可能会在以下情况下终止您的账户：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>违反这些条款</li>
                  <li>长期不活跃</li>
                  <li>欺诈或滥用行为</li>
                  <li>法律要求</li>
                </ul>
              </div>
            </section>

            {/* 九、争议解决 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                九、争议解决
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  任何因这些条款或使用我们的服务而产生的争议，应首先通过友好协商解决。
                </p>
                <p className="text-gray-700 mb-4">
                  如果协商失败，争议应提交给有管辖权的法院解决。
                </p>
                <p className="text-gray-700">
                  这些条款受中华人民共和国法律管辖，但不影响任何强制性消费者保护法的适用。
                </p>
              </div>
            </section>

            {/* 十、条款更新 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                十、条款更新
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  我们可能会不时更新这些条款。重大变更将通过以下方式通知您：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>在我们的网站上发布通知</li>
                  <li>通过电子邮件发送通知</li>
                  <li>在应用程序内显示通知</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  继续使用我们的服务即表示您接受更新后的条款。如果您不同意更新后的条款，请停止使用我们的服务。
                </p>
              </div>
            </section>

            {/* 十一、联系我们 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="mr-3 text-red-500" size={24} />
                十一、联系我们
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  如果您对这些服务条款有任何疑问、意见或建议，请通过以下方式联系我们：
                </p>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ConnectEd Elite Social Club</h3>
                  <div className="flex items-center text-gray-700 mb-2">
                    <Mail className="mr-2 text-red-500" size={16} />
                    <span>📧 邮箱：support@connectedclub.com</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-2">
                    <MapPin className="mr-2 text-red-500" size={16} />
                    <span>📮 地址：PO Box 470490, San Francisco, CA 94147</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Globe className="mr-2 text-red-500" size={16} />
                    <span>🌐 网站：http://www.connectedclub.com</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 生效日期 */}
            <section className="mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">生效日期</h2>
                <p className="text-gray-700">
                  这些服务条款自 2025年8月3日 起生效，并取代之前的所有条款和条件。
                </p>
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