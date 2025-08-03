import Link from 'next/link'

export default function SimpleFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ConnectEd Elite</h3>
            <p className="text-gray-300 text-sm">
              现代化的网页版交友软件，帮助你找到真正的爱情。
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-white">首页</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">关于我们</Link></li>
              <li><Link href="/join-us" className="text-gray-300 hover:text-white">加入我们</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">支持</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-300 hover:text-white">联系我们</Link></li>
              <li><Link href="/help" className="text-gray-300 hover:text-white">帮助中心</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">法律</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-300 hover:text-white">隐私政策</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white">服务条款</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2024 ConnectEd Elite Social Club. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  )
} 