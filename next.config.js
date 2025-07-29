/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用静态优化和缓存
  experimental: {
    serverComponentsExternalPackages: [],
    // 强制动态渲染
    dynamicIO: false,
  },
  // 禁用图片优化缓存
  images: {
    unoptimized: true,
  },
  // 自定义头部
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Force-Dynamic',
            value: 'true',
          },
        ],
      },
    ]
  },
  // 禁用构建时的静态生成
  output: 'standalone',
  // 强制服务器端渲染
  trailingSlash: false,
  // 禁用自动静态优化
  poweredByHeader: false,
  // 自定义webpack配置以禁用缓存
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // 生产环境禁用缓存
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig 