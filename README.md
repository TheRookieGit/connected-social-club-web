# 社交俱乐部 - 网页版交友软件

一个现代化的网页版交友应用，使用 Next.js、React、TypeScript 和 Tailwind CSS 构建。

## 功能特色

- 🔐 **用户认证** - 安全的注册和登录系统
- 📧 **邮箱验证** - 发送验证码到邮箱验证真人
- 📱 **手机验证** - 发送验证码到手机验证真人
- 👥 **智能匹配** - 基于兴趣和性格的用户匹配
- 💬 **实时聊天** - 与匹配用户进行实时交流
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **现代化UI** - 美观的用户界面和流畅的动画效果
- 🔒 **隐私保护** - 完善的隐私设置和用户数据保护

## 技术栈

- **前端框架**: Next.js 14
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **状态管理**: Zustand
- **表单处理**: React Hook Form
- **邮件服务**: Nodemailer
- **短信服务**: Twilio

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# 邮件服务配置
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio短信服务配置
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 项目结构

```
social-club-web/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   └── auth/          # 认证相关API
│   │       ├── send-email-code/  # 邮箱验证码
│   │       └── send-sms-code/    # 手机验证码
│   ├── dashboard/         # 用户仪表板
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── LoginForm.tsx      # 登录表单
│   ├── RegisterForm.tsx   # 注册表单（含验证码）
│   ├── UserCard.tsx       # 用户卡片
│   ├── ChatPanel.tsx      # 聊天面板
│   └── ProfileModal.tsx   # 个人资料
├── public/                # 静态资源
├── package.json           # 项目配置
├── tailwind.config.js     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
├── config.md              # 验证码配置说明
└── README.md              # 项目说明
```

## 主要功能

### 1. 用户认证与验证
- 用户注册和登录
- 邮箱验证码验证
- 手机验证码验证
- 密码加密和验证
- 记住登录状态

### 2. 用户匹配
- 浏览推荐用户
- 点赞、跳过、超级喜欢
- 智能匹配算法

### 3. 实时聊天
- 与匹配用户聊天
- 消息历史记录
- 在线状态显示

### 4. 个人资料管理
- 编辑个人信息
- 上传头像
- 设置兴趣爱好
- 隐私设置

## 验证码功能

### 邮箱验证
- 发送6位数字验证码到邮箱
- 10分钟有效期
- 美观的HTML邮件模板
- 防重复发送（1分钟间隔）

### 手机验证
- 发送6位数字验证码到手机
- 10分钟有效期
- 中国大陆手机号格式验证
- 防重复发送（1分钟间隔）

### 配置说明
详细的验证码配置说明请查看 [config.md](./config.md) 文件。

## 开发说明

### 环境要求
- Node.js 18+ 
- npm/yarn/pnpm

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 部署
项目可以部署到以下平台：
- Vercel (推荐)
- Netlify
- AWS Amplify
- 自托管服务器

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱: support@socialclub.com
- 网站: https://socialclub.com

---

**注意**: 这是一个演示项目，实际部署时需要配置真实的数据库和后端API。 