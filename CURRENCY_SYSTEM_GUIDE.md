# 桃花币系统部署指南

## 概述

桃花币系统是一个完整的虚拟货币解决方案，专为交友应用设计。用户可以通过各种活动获得桃花币，并用于购买平台功能和服务。

## 系统特性

### 🪙 货币系统
- **桃花币**：平台虚拟货币
- **钱包管理**：用户余额、交易记录
- **安全交易**：事务性操作，确保数据一致性

### 🎯 获取机制
- **每日任务**：登录、发送消息等
- **一次性奖励**：完善资料、上传照片等
- **成就系统**：连续登录、活跃用户等
- **推荐奖励**：成功推荐好友

### 🛍️ 消费项目
- **功能解锁**：超级喜欢、重新匹配等
- **加速服务**：无限滑动、优先展示等
- **高级功能**：隐身模式、高级筛选等

### 🎁 礼物系统
- **表情礼物**：玫瑰、爱心、星星等
- **特殊礼物**：钻石、皇冠等
- **动画礼物**：烟花、彩虹等

## 数据库部署

### 1. 执行数据库脚本

```bash
# 连接到你的 Supabase 数据库
psql -h your-supabase-host -U your-username -d your-database -f currency_system_schema.sql
```

### 2. 验证表结构

```sql
-- 检查表是否创建成功
\dt user_wallets
\dt currency_transactions
\dt currency_rules
\dt currency_products
\dt gifts

-- 检查默认数据
SELECT * FROM currency_rules LIMIT 5;
SELECT * FROM currency_products LIMIT 5;
SELECT * FROM gifts LIMIT 5;
```

## 前端集成

### 1. 在导航中添加货币系统入口

```tsx
// 在导航组件中添加
<Link href="/currency" className="flex items-center space-x-2">
  <Heart className="h-5 w-5" />
  <span>桃花币</span>
</Link>
```

### 2. 在用户资料中显示余额

```tsx
// 在 ProfileModal 中添加钱包显示
import WalletDisplay from '@/components/WalletDisplay'

// 在适当位置添加
<WalletDisplay userId={profile.id} />
```

### 3. 在聊天界面集成礼物功能

```tsx
// 在聊天组件中添加礼物按钮
import { Gift } from 'lucide-react'

// 添加礼物发送功能
const handleSendGift = async (giftId: number) => {
  const response = await fetch('/api/currency/gift', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: currentUserId,
      receiver_id: receiverId,
      gift_id: giftId,
      conversation_id: conversationId
    })
  })
}
```

## API 使用示例

### 获取用户钱包余额

```javascript
const response = await fetch(`/api/currency/wallet?userId=${userId}`)
const result = await response.json()

if (result.success) {
  console.log('余额:', result.data.balance)
  console.log('总收入:', result.data.total_earned)
  console.log('总支出:', result.data.total_spent)
}
```

### 根据规则获取货币

```javascript
const response = await fetch('/api/currency/earn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rule_name: '每日登录',
    user_id: userId
  })
})

const result = await response.json()
if (result.success) {
  console.log('获得桃花币:', result.message)
}
```

### 购买商品

```javascript
const response = await fetch('/api/currency/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 1,
    user_id: userId
  })
})

const result = await response.json()
if (result.success) {
  console.log('购买成功:', result.message)
}
```

### 发送礼物

```javascript
const response = await fetch('/api/currency/gift', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender_id: currentUserId,
    receiver_id: receiverId,
    gift_id: giftId,
    message: '送你一朵玫瑰',
    conversation_id: conversationId
  })
})

const result = await response.json()
if (result.success) {
  console.log('礼物发送成功')
}
```

## 业务逻辑集成

### 1. 用户注册时创建钱包

```typescript
// 在用户注册成功后
import { CurrencyService } from '@/lib/currencyService'

const wallet = await CurrencyService.createUserWallet(newUserId)
if (wallet) {
  // 给新用户一些初始桃花币
  await CurrencyService.earnByRule({
    rule_name: '完善资料',
    user_id: newUserId
  })
}
```

### 2. 每日登录奖励

```typescript
// 在用户登录时检查
const today = new Date().toISOString().split('T')[0]
const hasEarnedToday = await checkDailyEarning(userId, '每日登录', today)

if (!hasEarnedToday) {
  await CurrencyService.earnByRule({
    rule_name: '每日登录',
    user_id: userId
  })
}
```

### 3. 消息发送奖励

```typescript
// 在发送消息时
const messageCount = await getTodayMessageCount(userId)
if (messageCount < 20) { // 每日最多20次
  await CurrencyService.earnByRule({
    rule_name: '发送消息',
    user_id: userId
  })
}
```

### 4. 成功匹配奖励

```typescript
// 在匹配成功时
await CurrencyService.earnByRule({
  rule_name: '成功匹配',
  user_id: userId,
  reference_id: matchId.toString(),
  reference_type: 'match'
})
```

## 自定义配置

### 1. 修改货币获取规则

```sql
-- 更新规则金额
UPDATE currency_rules 
SET amount = 15.00 
WHERE rule_name = '每日登录';

-- 添加新规则
INSERT INTO currency_rules (rule_name, rule_type, amount, max_daily_limit, description) 
VALUES ('分享动态', 'daily', 8.00, 5, '每日分享动态获得8个桃花币');
```

### 2. 添加新商品

```sql
-- 添加新商品
INSERT INTO currency_products (product_name, product_type, price, description) 
VALUES ('VIP会员', 'premium', 500.00, '享受VIP专属功能');
```

### 3. 添加新礼物

```sql
-- 添加新礼物
INSERT INTO gifts (gift_name, gift_type, price, icon_url) 
VALUES ('生日蛋糕', 'special', 25.00, '/gifts/birthday-cake.png');
```

## 监控和分析

### 1. 货币系统统计

```sql
-- 获取系统统计
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  SUM(balance) as total_balance,
  COUNT(*) as total_transactions
FROM user_wallets;

-- 获取热门商品
SELECT 
  p.product_name,
  COUNT(*) as purchase_count
FROM user_purchases up
JOIN currency_products p ON up.product_id = p.id
GROUP BY p.id, p.product_name
ORDER BY purchase_count DESC;
```

### 2. 用户行为分析

```sql
-- 获取用户获取货币排行
SELECT 
  u.name,
  uw.total_earned,
  uw.total_spent,
  uw.balance
FROM user_wallets uw
JOIN users u ON uw.user_id = u.id
ORDER BY uw.total_earned DESC
LIMIT 10;
```

## 安全考虑

### 1. 事务安全
- 所有货币操作都使用数据库事务
- 确保余额不会出现负数
- 防止重复获取奖励

### 2. 权限控制
- 验证用户身份
- 检查操作权限
- 记录所有操作日志

### 3. 防刷机制
- 每日获取限制
- 总获取限制
- 异常行为检测

## 故障排除

### 1. 常见问题

**Q: 用户钱包创建失败**
A: 检查用户ID是否存在，确保数据库连接正常

**Q: 货币获取失败**
A: 检查规则是否存在且启用，验证每日限制

**Q: 购买商品失败**
A: 检查用户余额是否充足，商品是否存在

### 2. 日志查看

```sql
-- 查看最近的交易记录
SELECT * FROM currency_transactions 
ORDER BY created_at DESC 
LIMIT 20;

-- 查看错误交易
SELECT * FROM currency_transactions 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## 扩展功能

### 1. 充值系统
- 集成第三方支付
- 支持多种充值金额
- 充值优惠活动

### 2. 抽奖系统
- 消耗桃花币参与抽奖
- 多种奖品类型
- 概率控制

### 3. 任务系统
- 复杂任务链
- 任务进度追踪
- 阶段性奖励

### 4. 排行榜
- 财富排行榜
- 活跃度排行榜
- 消费排行榜

## 联系支持

如果在部署或使用过程中遇到问题，请：

1. 检查数据库连接和权限
2. 查看服务器日志
3. 验证API接口响应
4. 确认前端组件正确导入

---

**注意**：在生产环境部署前，请确保：
- 数据库备份
- 环境变量配置
- 安全策略设置
- 性能测试 