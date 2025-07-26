# 数据库设置指南

## 🗄️ Supabase 数据库设置

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: social-club-web
   - **Database Password**: 设置一个强密码
   - **Region**: 选择离你最近的地区

### 2. 创建用户表

在 Supabase SQL Editor 中运行以下 SQL：

```sql
-- 创建用户表
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有操作，实际应用中应该更严格）
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
```

### 3. 获取环境变量

在 Supabase 项目设置中找到：

1. **Settings** → **API**
2. 复制以下信息：
   - **Project URL**
   - **anon public** key

### 4. 设置环境变量

创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## 🚀 部署到生产环境

### Vercel 部署

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

4. **设置生产环境变量**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add JWT_SECRET
   ```

### 其他部署选项

- **Netlify**: 支持 Next.js，免费
- **Railway**: 简单易用，有免费额度
- **DigitalOcean App Platform**: 稳定可靠
- **AWS Amplify**: 企业级选择

## 🔧 本地开发

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **设置环境变量**:
   复制 `.env.local.example` 到 `.env.local` 并填写你的 Supabase 信息

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

## 📊 数据库管理

### 查看用户数据

在 Supabase Dashboard 中：
1. **Table Editor** → **users**
2. 可以查看、编辑、删除用户数据

### 备份数据

```sql
-- 导出用户数据
SELECT * FROM users;
```

## 🔒 安全注意事项

1. **环境变量**: 永远不要提交 `.env.local` 到 Git
2. **数据库密码**: 使用强密码
3. **JWT Secret**: 使用随机生成的强密钥
4. **Row Level Security**: 在生产环境中配置适当的 RLS 策略
5. **HTTPS**: 确保生产环境使用 HTTPS

## 🐛 常见问题

### 连接错误
- 检查 Supabase URL 和 Key 是否正确
- 确认网络连接正常
- 检查 Supabase 项目是否激活

### 认证错误
- 确认 JWT_SECRET 已设置
- 检查用户表是否正确创建
- 验证 RLS 策略配置

### 部署错误
- 确认所有环境变量都已设置
- 检查 Vercel 构建日志
- 验证 Supabase 项目状态 