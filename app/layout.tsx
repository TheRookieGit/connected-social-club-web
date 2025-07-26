import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '社交俱乐部 - 找到你的另一半',
  description: '现代化的网页版交友软件，帮助你找到真正的爱情',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
} 