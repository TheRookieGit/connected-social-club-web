# Stream Chat 集成说明

## 概述

已成功将左侧聊天框从 `BeautifulChatPanel` 切换到 `StreamChatPanel`，实现了使用 Stream Chat 进行实时聊天的功能。

## 主要修改

### 1. Dashboard 页面修改
- 文件：`app/dashboard/page.tsx`
- 将动态导入从 `BeautifulChatPanel` 改为 `StreamChatPanel`
- 添加 `position="left"` 参数，使聊天面板显示在左侧

### 2. StreamChatPanel 组件增强
- 文件：`components/StreamChatPanel.tsx`
- 添加了 `position` 参数支持，可以是 `'left'` 或 `'right'`
- 实现了两种不同的布局：
  - **左侧布局**：全屏覆盖式聊天界面，包含聊天区域和用户列表
  - **右侧布局**：原有的右侧面板布局

### 3. 左侧布局特性
- 全屏覆盖式设计
- 聊天内容区域占据主要空间
- 底部显示匹配用户列表
- 支持用户切换和未读消息提示
- 响应式设计，适配不同屏幕尺寸

### 4. 右侧布局特性
- 保持原有的右侧面板设计
- 支持折叠/展开功能
- 独立的聊天框弹出窗口
- 用户列表和聊天分离显示

## 技术实现

### Stream Chat 配置
- API Key: `d8z9uqdhrj3a`
- API Secret: `yx2au2yuz72c9tk9uftwd8v6mrmw4nm4dctx3sy6g9qbstnsvc9vfjxazyersned`
- 令牌生成 API: `/api/stream/token`

### 核心功能
1. **用户认证**：通过 JWT 令牌获取 Stream Chat 令牌
2. **频道管理**：自动为匹配用户创建聊天频道
3. **实时消息**：支持实时发送和接收消息
4. **用户状态**：显示在线状态和未读消息数量
5. **头像显示**：支持用户头像和默认头像

## 使用方法

### 在 Dashboard 中使用
```tsx
<StreamChatPanel
  matchedUsers={matchedUsers}
  onClose={() => setShowChat(false)}
  initialUserId={initialChatUserId || undefined}
  isOpen={showChat}
  position="left"  // 设置为左侧布局
/>
```

### 测试页面
访问 `/test-stream-chat` 可以测试 Stream Chat 功能。

## 环境要求

确保以下环境变量已正确配置：
- `NEXT_PUBLIC_STREAM_API_KEY`
- `STREAM_API_SECRET`
- `JWT_SECRET`

## 注意事项

1. Stream Chat 需要网络连接才能正常工作
2. 用户需要先登录才能使用聊天功能
3. 聊天频道会在用户匹配时自动创建
4. 支持初始用户ID，可以自动打开与特定用户的聊天

## 下一步优化

1. 添加消息通知功能
2. 优化移动端体验
3. 添加表情符号支持
4. 实现消息搜索功能
5. 添加文件上传功能 