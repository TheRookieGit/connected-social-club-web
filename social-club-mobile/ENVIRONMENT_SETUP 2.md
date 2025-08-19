# 移动端环境配置指南

## 1. 环境变量配置

### 步骤1: 创建 .env 文件
在 `social-club-mobile` 目录下创建 `.env` 文件：

```bash
# 复制示例文件
cp env.example .env
```

### 步骤2: 配置环境变量
编辑 `.env` 文件，填入您的实际配置：

```env
# API配置
EXPO_PUBLIC_API_BASE_URL=https://your-actual-domain.com/api

# Supabase配置 (从web端复制)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stream Chat配置 (从web端复制)
EXPO_PUBLIC_STREAM_API_KEY=your-stream-api-key

# LinkedIn OAuth配置 (从web端复制)
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=your-linkedin-client-id
EXPO_PUBLIC_LINKEDIN_REDIRECT_URI=socialclub://auth-callback

# 其他配置
EXPO_PUBLIC_APP_NAME=Social Club
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## 2. 获取配置值

### Supabase配置
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 Settings > API
4. 复制以下值：
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - anon public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Stream Chat配置
1. 登录 [Stream Dashboard](https://dashboard.getstream.io/)
2. 选择您的应用
3. 进入 API Keys
4. 复制以下值：
   - API Key → `EXPO_PUBLIC_STREAM_API_KEY`

### LinkedIn OAuth配置
1. 登录 [LinkedIn Developers](https://www.linkedin.com/developers/)
2. 选择您的应用
3. 进入 Auth 设置
4. 复制以下值：
   - Client ID → `EXPO_PUBLIC_LINKEDIN_CLIENT_ID`
5. 添加重定向URL：`socialclub://auth-callback`

## 3. API域名配置

### 开发环境
如果您在本地开发，API域名可能是：
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 生产环境
如果您已部署到Vercel或其他平台：
```env
EXPO_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api
```

## 4. 验证配置

### 步骤1: 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npx expo start
```

### 步骤2: 检查环境变量
在代码中可以通过以下方式检查：
```javascript
console.log('API URL:', process.env.EXPO_PUBLIC_API_BASE_URL)
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
```

## 5. 常见问题

### 问题1: 环境变量不生效
**解决方案：**
- 确保变量名以 `EXPO_PUBLIC_` 开头
- 重启开发服务器
- 检查 `.env` 文件是否在正确位置

### 问题2: LinkedIn登录失败
**解决方案：**
- 确保重定向URL正确配置
- 检查Client ID是否正确
- 验证应用权限设置

### 问题3: Stream Chat连接失败
**解决方案：**
- 检查API Key是否正确
- 确认Stream应用配置
- 验证网络连接

### 问题4: Supabase连接失败
**解决方案：**
- 检查URL和Key是否正确
- 确认Supabase项目状态
- 验证RLS策略设置

## 6. 安全注意事项

1. **不要提交 .env 文件到Git**
   ```bash
   # 确保 .env 在 .gitignore 中
   echo ".env" >> .gitignore
   ```

2. **使用不同的密钥**
   - 开发环境和生产环境使用不同的密钥
   - 定期轮换密钥

3. **限制API访问**
   - 配置适当的CORS策略
   - 设置API速率限制

## 7. 部署配置

### EAS Build (推荐)
```bash
# 安装EAS CLI
npm install -g @expo/eas-cli

# 登录
eas login

# 配置构建
eas build:configure

# 构建应用
eas build --platform ios
eas build --platform android
```

### 本地构建
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 8. 测试清单

- [ ] 环境变量正确加载
- [ ] Supabase连接正常
- [ ] Stream Chat连接正常
- [ ] LinkedIn登录功能正常
- [ ] API调用成功
- [ ] 照片上传功能正常
- [ ] 位置服务正常
- [ ] 推送通知配置正确

完成以上配置后，您的移动端应用就可以正常运行了！ 