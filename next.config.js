/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 禁用ESLint引号检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 配置图片域名，允许加载Supabase存储的图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ckhxivbcnagwgpzljzrl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    // 禁用图片优化，直接使用原始图片
    unoptimized: true,
  },
  
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig 