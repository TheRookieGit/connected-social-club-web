# 验证码功能配置说明

## 📧 邮箱验证配置

### 1. Gmail配置
在项目根目录创建 `.env.local` 文件，添加以下配置：

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**获取Gmail应用密码：**
1. 登录Google账户
2. 进入"安全性"设置
3. 开启"两步验证"
4. 生成"应用专用密码"
5. 使用生成的16位密码作为 `EMAIL_PASS`

### 2. 其他邮件服务
如需使用其他邮件服务，修改 `app/api/auth/send-email-code/route.ts` 中的配置：

```javascript
const transporter = nodemailer.createTransporter({
  service: 'qq', // 或其他服务
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})
```

## 📱 短信验证配置

### 1. Twilio配置
在 `.env.local` 文件中添加：

```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

**获取Twilio凭据：**
1. 注册Twilio账户
2. 在控制台获取Account SID和Auth Token
3. 购买一个电话号码作为发送号码

### 2. 其他短信服务
如需使用其他短信服务，修改 `app/api/auth/send-sms-code/route.ts` 中的 `sendSMS` 函数。

## 🔧 开发环境测试

### 邮箱验证测试
1. 配置好邮箱服务
2. 在注册页面输入邮箱
3. 点击"发送验证码"
4. 检查邮箱收件箱
5. 输入验证码并验证

### 短信验证测试
1. 配置好短信服务
2. 在注册页面输入手机号
3. 点击"发送验证码"
4. 检查手机短信
5. 输入验证码并验证

## 🚀 生产环境部署

### 1. 环境变量
确保在生产环境中正确设置所有环境变量。

### 2. 验证码存储
生产环境建议使用Redis存储验证码：
```javascript
// 替换内存存储为Redis
const redis = require('redis')
const client = redis.createClient()

// 存储验证码
await client.setex(`email_code:${email}`, 600, code)

// 获取验证码
const storedCode = await client.get(`email_code:${email}`)
```

### 3. 安全考虑
- 限制验证码发送频率
- 验证码有效期设置
- 防止暴力破解
- 日志记录和监控

## 📋 功能特性

### 邮箱验证
- ✅ 6位数字验证码
- ✅ 10分钟有效期
- ✅ 美观的HTML邮件模板
- ✅ 防重复发送（1分钟间隔）

### 手机验证
- ✅ 6位数字验证码
- ✅ 10分钟有效期
- ✅ 中国大陆手机号格式验证
- ✅ 防重复发送（1分钟间隔）

### 用户体验
- ✅ 倒计时显示
- ✅ 验证状态提示
- ✅ 错误信息反馈
- ✅ 表单验证

## 🔍 故障排除

### 常见问题
1. **邮件发送失败**
   - 检查邮箱配置
   - 确认应用密码正确
   - 检查网络连接

2. **短信发送失败**
   - 检查Twilio配置
   - 确认账户余额充足
   - 验证手机号格式

3. **验证码验证失败**
   - 检查验证码是否正确
   - 确认验证码未过期
   - 查看服务器日志

### 调试模式
在开发环境中，验证码会打印到控制台：
```
模拟发送短信到 13800138000，验证码：123456
``` 