# LinkedIn OAuth设置指南

## 1. 创建LinkedIn应用

1. 访问 [LinkedIn开发者平台](https://www.linkedin.com/developers/)
2. 点击"创建应用"
3. 填写应用信息：
   - **应用名称**: 你的应用名称 (例如: "社交俱乐部")
   - **LinkedIn页面**: 选择你的LinkedIn页面或公司页面
   - **应用用途**: 选择适合的选项 (例如: "教育" 或 "商业")
   - **描述**: 简要描述你的应用

## 2. 配置OAuth设置

1. 在应用设置中找到 **"Auth"** 标签
2. 在 **"重定向URL"** 部分添加：
   ```
   http://localhost:3000/api/auth/linkedin/callback
   ```
3. 在 **"OAuth 2.0 scopes"** 部分请求以下权限：
   - `openid`
   - `profile` 
   - `email`

## 3. 获取凭据

1. 在应用的 **"Auth"** 标签页面，复制：
   - **Client ID**
   - **Client Secret**

## 4. 配置环境变量

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的LinkedIn应用凭据：
   ```env
   LINKEDIN_CLIENT_ID=你的LinkedIn_Client_ID
   LINKEDIN_CLIENT_SECRET=你的LinkedIn_Client_Secret
   LINKEDIN_CALLBACK_URL=http://localhost:3000/api/auth/linkedin/callback
   JWT_SECRET=一个强随机字符串
   NEXTAUTH_URL=http://localhost:3000
   ```

## 5. 生产环境配置

当部署到生产环境时，需要：

1. 在LinkedIn应用设置中添加生产环境的重定向URL：
   ```
   https://你的域名.com/api/auth/linkedin/callback
   ```

2. 更新环境变量：
   ```env
   LINKEDIN_CALLBACK_URL=https://你的域名.com/api/auth/linkedin/callback
   NEXTAUTH_URL=https://你的域名.com
   ```

## 6. 测试LinkedIn登录

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问登录页面
3. 点击 **"使用LinkedIn登录"** 按钮
4. 在LinkedIn页面授权应用
5. 成功后应该会重定向回你的应用

## 故障排除

### 常见错误

1. **"Invalid redirect URI"**
   - 检查LinkedIn应用设置中的重定向URL是否与代码中的一致
   - 确保URL完全匹配（包括协议、端口等）

2. **"Client ID not found"**
   - 确认LINKEDIN_CLIENT_ID环境变量设置正确
   - 检查LinkedIn应用是否已激活

3. **"Access denied"**
   - 检查OAuth权限范围是否正确配置
   - 确认用户同意了所有必要的权限

### 调试提示

1. 检查浏览器控制台是否有错误信息
2. 检查LinkedIn应用的状态和配置
3. 确认所有环境变量都已正确设置
4. 查看服务器日志以获取详细错误信息 