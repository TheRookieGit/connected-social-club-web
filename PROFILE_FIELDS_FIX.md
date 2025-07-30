# 用户资料字段修复说明

## 问题描述

用户在注册时填写的"家庭计划"和"约会目的"在数据库中看不到，这是因为：

1. **家庭计划字段** (`family_plans`) 已经存在于数据库中，但可能没有正确保存
2. **约会目的字段** 在数据库中有两个不同的实现：
   - `dating_style` 字段（已存在）
   - `relationship_goals` 字段（缺失）

## 解决方案

### 1. 数据库字段修复

运行 `add_missing_fields.sql` 脚本来添加缺失的字段：

```sql
-- 在 Supabase SQL Editor 中运行
-- 添加 relationship_goals 字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS relationship_goals TEXT[];

-- 确保 user_relationship_preferences 表存在
CREATE TABLE IF NOT EXISTS user_relationship_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  dating_style VARCHAR(50),
  family_plans VARCHAR(50),
  relationship_goals TEXT[],
  deal_breakers TEXT[],
  must_haves TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 2. 代码更新

已更新的文件：

1. **types/user.ts** - 添加了 `relationship_goals` 字段类型定义
2. **app/api/user/profile/route.ts** - 添加了对 `relationship_goals` 字段的支持
3. **app/dating-goals/page.tsx** - 现在同时保存到 `dating_style` 和 `relationship_goals` 字段

### 3. 字段映射

| 页面 | 字段名 | 数据类型 | 说明 |
|------|--------|----------|------|
| 家庭计划页面 | `family_plans` | VARCHAR(50) | 家庭计划选择 |
| 家庭计划页面 | `has_kids` | BOOLEAN | 是否有孩子 |
| 约会目的页面 | `dating_style` | VARCHAR(50) | 约会风格（单选） |
| 约会目的页面 | `relationship_goals` | TEXT[] | 约会目标（数组） |

### 4. 测试页面

创建了测试页面 `/test-profile-fields` 来验证字段是否正确保存和显示。

## 验证步骤

1. 运行 `add_missing_fields.sql` 脚本
2. 重新注册一个用户或更新现有用户的资料
3. 访问 `/test-profile-fields` 页面查看字段值
4. 检查数据库中的 `users` 表确认字段存在且有值

## 注意事项

- `family_plans` 字段存储用户对孩子的计划（如：want_kids, open_to_kids, dont_want_kids, not_sure）
- `has_kids` 字段存储用户当前是否有孩子（true/false）
- `dating_style` 字段存储约会风格（如：long_term, life_partner, casual_dates 等）
- `relationship_goals` 字段存储约会目标数组，支持多选

## 相关文件

- `add_missing_fields.sql` - 数据库修复脚本
- `app/test-profile-fields/page.tsx` - 测试页面
- `types/user.ts` - 类型定义
- `app/api/user/profile/route.ts` - API 接口
- `app/dating-goals/page.tsx` - 约会目的页面
- `app/family-plans/page.tsx` - 家庭计划页面 