# 环境变量设置指南

## 🔧 解决环境变量问题

您遇到的 `Missing Supabase environment variables` 错误是因为缺少必要的环境变量配置。

## 📋 需要设置的环境变量

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件，添加以下内容：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT密钥
JWT_SECRET=your_jwt_secret_here

# 开发环境配置
NODE_ENV=development
```

### 2. 获取Supabase配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 Settings → API
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. 设置JWT密钥

生成一个安全的JWT密钥：

```bash
# 在终端中运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

将生成的密钥设置为 `JWT_SECRET`。

## 🚀 快速设置步骤

### 方法1: 手动创建文件

1. 在项目根目录创建 `.env.local` 文件
2. 复制上面的环境变量模板
3. 替换为您的实际值
4. 重启开发服务器

### 方法2: 使用命令行

```bash
# 创建环境变量文件
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
EOF

# 重启开发服务器
npm run dev
```

## 🔍 验证配置

### 1. 检查环境变量

访问 `/api/debug-bucket` 页面来验证配置是否正确。

### 2. 测试数据库连接

访问 `/api/test-db` 页面来测试数据库连接。

### 3. 查看控制台

在浏览器开发者工具中查看是否有环境变量相关的错误。

## 🛠️ 数据库设置

### 1. 运行修复版本的数据库脚本

在Supabase SQL Editor中运行 `database_schema_extended_fixed.sql`：

```sql
-- 这个脚本解决了UUID到BIGINT的类型转换问题
-- 使用简化的权限控制，避免复杂的类型转换
```

### 2. 设置头像存储

运行 `setup_avatar_storage.sql` 来设置头像上传功能。

## 🚨 常见问题

### 问题1: 环境变量不生效
- 确保文件名是 `.env.local`（不是 `.env.local.txt`）
- 重启开发服务器
- 检查文件是否在项目根目录

### 问题2: 数据库连接失败
- 检查Supabase URL和密钥是否正确
- 确认项目是否激活
- 检查网络连接

### 问题3: JWT错误
- 确保JWT_SECRET已设置
- 检查密钥长度（建议32字符以上）
- 重启服务器

## 📞 获取帮助

如果仍有问题：

1. 检查浏览器控制台错误信息
2. 查看终端输出
3. 确认所有环境变量都已正确设置
4. 验证Supabase项目配置

## 🔒 安全注意事项

- 不要将 `.env.local` 文件提交到Git
- 在生产环境中使用不同的密钥
- 定期轮换JWT密钥
- 限制Supabase API密钥的权限

---

**注意**: 设置好环境变量后，重新启动开发服务器即可解决 `Missing Supabase environment variables` 错误。 