# LinkedIn风格聊天浮窗使用指南

## 概述

这是一个模仿LinkedIn消息浮窗设计的聊天组件，位于页面右下角，提供现代化的聊天体验。

## 主要特性

### 🎯 设计特点
- **右下角浮窗**: 固定在页面右下角，不占用主要内容空间
- **LinkedIn风格**: 采用LinkedIn消息界面的设计语言
- **响应式布局**: 自适应不同屏幕尺寸
- **最小化/最大化**: 支持窗口大小调整

### 💬 功能特性
- **左侧对话列表**: 显示所有聊天对话，支持置顶和删除
- **右侧用户搜索**: 搜索并添加新用户开始对话
- **实时消息**: 基于Stream Chat的实时消息功能
- **在线状态**: 显示用户在线状态
- **消息预览**: 显示最后一条消息和时间

## 组件结构

### 文件位置
```
components/
├── LinkedInStyleChatPanel.tsx    # 主聊天组件
└── StreamChatPanel.tsx           # 原始聊天组件（保留）

app/
└── test-linkedin-chat/
    └── page.tsx                  # 测试页面
```

### 组件接口

```typescript
interface LinkedInStyleChatPanelProps {
  matchedUsers: any[]           // 匹配用户列表
  onClose: () => void          // 关闭回调函数
  initialUserId?: string       // 初始选中的用户ID（可选）
}
```

## 使用方法

### 1. 基本使用

```tsx
import LinkedInStyleChatPanel from '@/components/LinkedInStyleChatPanel'

function MyPage() {
  const [showChat, setShowChat] = useState(false)
  const [matchedUsers, setMatchedUsers] = useState([])

  return (
    <div>
      {/* 页面内容 */}
      
      {/* 聊天浮窗 */}
      {showChat && (
        <LinkedInStyleChatPanel
          matchedUsers={matchedUsers}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
```

### 2. 获取匹配用户

```tsx
useEffect(() => {
  const fetchMatchedUsers = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/user/matched-users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      setMatchedUsers(data.users || [])
    }
  }
  
  fetchMatchedUsers()
}, [])
```

### 3. 测试页面

访问 `/test-linkedin-chat` 页面查看完整示例。

## 界面说明

### 头部区域
- **标题**: "消息"
- **控制按钮**: 
  - 最大化/最小化
  - 最小化到图标
  - 关闭

### 搜索栏
- **搜索框**: 搜索用户开始新对话
- **实时搜索**: 输入时自动搜索用户

### 标签页
- **专注**: 主要对话列表
- **其他**: 次要对话（预留功能）

### 左侧：对话列表
- **用户头像**: 显示用户头像或首字母
- **在线状态**: 绿色圆点表示在线
- **用户名称**: 显示用户姓名
- **最后消息**: 显示最后一条消息预览
- **时间**: 显示最后消息时间
- **操作菜单**: 置顶/删除对话

### 右侧：聊天窗口/用户列表
- **聊天窗口**: 选中对话时显示聊天界面
- **用户列表**: 搜索时显示搜索结果
- **空状态**: 未选择对话时显示提示

## 样式定制

### 主题色彩
- **主色调**: 蓝色系 (`blue-600`, `blue-700`)
- **背景色**: 白色 (`bg-white`)
- **边框色**: 灰色 (`border-gray-200`)
- **文字色**: 深灰色 (`text-gray-900`)

### 尺寸设置
- **默认尺寸**: `w-80 h-[500px]`
- **展开尺寸**: `w-96 h-[600px]`
- **最小化**: 圆形图标 `w-14 h-14`

### 自定义样式

```css
/* 覆盖Stream Chat默认样式 */
.str-chat__message-bubble {
  max-width: 100% !important;
  word-wrap: break-word !important;
}

.str-chat__message-text {
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}
```

## 状态管理

### 组件状态
- `isMinimized`: 是否最小化
- `isExpanded`: 是否展开
- `selectedChannel`: 当前选中的对话
- `searchTerm`: 搜索关键词
- `searchResults`: 搜索结果

### 错误处理
- **初始化错误**: 显示错误提示和重试按钮
- **网络错误**: 自动重试机制
- **权限错误**: 友好的错误信息

## 性能优化

### 懒加载
- 组件仅在需要时渲染
- 最小化时只显示图标

### 状态缓存
- 对话列表缓存
- 用户信息缓存

### 内存管理
- 组件卸载时清理连接
- 自动清理错误状态

## 浏览器兼容性

- **现代浏览器**: Chrome, Firefox, Safari, Edge
- **移动端**: 响应式设计，支持触摸操作
- **旧版浏览器**: 降级处理

## 故障排除

### 常见问题

1. **聊天服务连接失败**
   - 检查网络连接
   - 验证API密钥配置
   - 查看控制台错误信息

2. **用户搜索无结果**
   - 确认搜索关键词
   - 检查用户权限
   - 验证API端点

3. **消息发送失败**
   - 检查Stream Chat配置
   - 验证用户认证
   - 查看网络状态

### 调试模式

```tsx
// 启用详细日志
console.log('聊天组件状态:', {
  chatClient: !!chatClient,
  currentUser: !!currentUser,
  channels: channels.length,
  selectedChannel: !!selectedChannel
})
```

## 更新日志

### v1.0.0
- 初始版本发布
- 基本聊天功能
- LinkedIn风格界面
- 浮窗设计

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License 