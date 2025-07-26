# 🚀 部署指南 - 从本地到生产环境

## 📋 部署前准备

### 1. 代码准备
确保你的代码已经完成并测试通过：
```bash
# 检查代码状态
git status
git add .
git commit -m "准备部署到生产环境"
```

### 2. 数据库设置
按照 `DATABASE_SETUP.md` 的说明设置 Supabase 数据库。

## 🌐 部署选项

### 选项1: Vercel（推荐）

#### 优点：
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署
- ✅ 与 Next.js 完美集成

#### 部署步骤：

1. **安装 Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**:
   ```bash
   vercel login
   ```

3. **部署项目**:
   ```bash
   vercel
   ```

4. **设置环境变量**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add JWT_SECRET
   ```

5. **重新部署**:
   ```bash
   vercel --prod
   ```

#### 获得真实网址：
部署成功后，你会得到类似这样的网址：
- `https://social-club-web.vercel.app`
- `https://your-custom-domain.com`（如果配置了自定义域名）

### 选项2: Netlify

#### 部署步骤：

1. **构建项目**:
   ```bash
   npm run build
   ```

2. **上传到 Netlify**:
   - 访问 [netlify.com](https://netlify.com)
   - 拖拽 `out` 文件夹到部署区域

3. **设置环境变量**:
   - 在 Netlify Dashboard 中设置环境变量

### 选项3: Railway

#### 部署步骤：

1. **连接 GitHub**:
   - 访问 [railway.app](https://railway.app)
   - 连接你的 GitHub 仓库

2. **自动部署**:
   - Railway 会自动检测 Next.js 项目
   - 自动构建和部署

3. **设置环境变量**:
   - 在 Railway Dashboard 中设置

## 🔧 环境变量配置

### 必需的环境变量：

```env
# Supabase 数据库
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key
```

### 如何获取这些值：

1. **Supabase URL 和 Key**:
   - 登录 [supabase.com](https://supabase.com)
   - 进入你的项目
   - Settings → API
   - 复制 Project URL 和 anon public key

2. **JWT Secret**:
   - 生成一个强随机字符串：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 🌍 自定义域名

### 在 Vercel 中设置：

1. **添加域名**:
   - 在 Vercel Dashboard 中
   - Settings → Domains
   - 添加你的域名

2. **配置 DNS**:
   - 添加 CNAME 记录指向 `cname.vercel-dns.com`
   - 或者添加 A 记录指向 Vercel 的 IP

### 在 Netlify 中设置：

1. **自定义域名**:
   - Site settings → Domain management
   - 添加自定义域名

2. **SSL 证书**:
   - Netlify 自动提供免费 SSL 证书

## 📊 监控和分析

### 添加 Google Analytics：

1. **创建 GA4 账户**
2. **获取跟踪 ID**
3. **添加到项目中**:

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 🔒 安全配置

### 1. 环境变量安全：
- ✅ 永远不要提交 `.env.local` 到 Git
- ✅ 使用强密码和密钥
- ✅ 定期轮换密钥

### 2. 数据库安全：
- ✅ 启用 Supabase 的行级安全策略
- ✅ 限制数据库访问权限
- ✅ 定期备份数据

### 3. HTTPS 配置：
- ✅ 所有部署平台都自动提供 HTTPS
- ✅ 强制重定向 HTTP 到 HTTPS

## 📈 性能优化

### 1. 图片优化：
```tsx
import Image from 'next/image'

<Image
  src="/profile.jpg"
  alt="用户头像"
  width={200}
  height={200}
  priority
/>
```

### 2. 代码分割：
```tsx
import dynamic from 'next/dynamic'

const ChatPanel = dynamic(() => import('@/components/ChatPanel'), {
  loading: () => <p>加载中...</p>
})
```

### 3. 缓存策略：
```tsx
// 在 API 路由中添加缓存头
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

## 🐛 故障排除

### 常见问题：

1. **构建失败**:
   ```bash
   # 检查构建日志
   vercel logs
   
   # 本地测试构建
   npm run build
   ```

2. **环境变量未生效**:
   ```bash
   # 重新部署
   vercel --prod
   ```

3. **数据库连接失败**:
   - 检查 Supabase 项目状态
   - 验证环境变量是否正确
   - 确认网络连接

4. **域名解析问题**:
   - 检查 DNS 配置
   - 等待 DNS 传播（最多24小时）

## 📞 支持

如果遇到问题：

1. **查看文档**:
   - [Vercel 文档](https://vercel.com/docs)
   - [Supabase 文档](https://supabase.com/docs)
   - [Next.js 文档](https://nextjs.org/docs)

2. **社区支持**:
   - [Vercel 社区](https://github.com/vercel/vercel/discussions)
   - [Supabase 社区](https://github.com/supabase/supabase/discussions)

3. **联系支持**:
   - 各平台都提供技术支持

## 🎉 部署完成

部署成功后，你的社交俱乐部应用就有了：

- ✅ 真实的网址
- ✅ 真实的用户数据库
- ✅ 安全的用户认证
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 99.9% 可用性

现在你可以分享你的应用网址，让真实用户注册和使用了！ 