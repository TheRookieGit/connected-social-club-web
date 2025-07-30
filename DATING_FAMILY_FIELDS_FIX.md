# 约会目的和家庭计划字段同步问题解决方案

## 问题描述

用户在注册流程中填写的"约会目的"和"家庭计划"字段没有正确保存到数据库，显示为 `null`。

## 可能的原因

1. **数据库字段缺失**：`relationship_goals` 字段可能没有添加到 `users` 表中
2. **API权限问题**：用户资料更新API可能没有权限更新这些字段
3. **字段类型不匹配**：数据库字段类型与发送的数据类型不匹配

## 解决步骤

### 1. 检查数据库字段

在 Supabase SQL Editor 中运行 `check_database_fields.sql` 脚本：

```sql
-- 检查users表中的字段
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('dating_style', 'relationship_goals', 'family_plans', 'has_kids')
ORDER BY column_name;
```

### 2. 如果字段缺失，运行修复脚本

如果 `relationship_goals` 字段不存在，运行 `add_missing_fields.sql` 脚本：

```sql
-- 添加relationship_goals字段到users表
ALTER TABLE users ADD COLUMN IF NOT EXISTS relationship_goals TEXT[];
```

### 3. 测试字段保存

访问 `/test-dating-family-fields` 页面来测试字段保存功能：

1. 查看当前用户数据
2. 输入测试数据
3. 点击"保存测试数据"
4. 检查是否保存成功

### 4. 检查API权限

确保用户资料更新API (`/api/user/profile`) 有权限更新这些字段：

- `dating_style` (VARCHAR)
- `relationship_goals` (TEXT[])
- `family_plans` (VARCHAR)
- `has_kids` (BOOLEAN/VARCHAR)

## 字段映射

| 页面 | 字段名 | 数据类型 | 说明 |
|------|--------|----------|------|
| 约会目的页面 | `dating_style` | VARCHAR(50) | 约会风格（单选） |
| 约会目的页面 | `relationship_goals` | TEXT[] | 约会目标（数组） |
| 家庭计划页面 | `family_plans` | VARCHAR(50) | 家庭计划选择 |
| 家庭计划页面 | `has_kids` | VARCHAR(50) | 是否有孩子 |

## 测试页面

- `/test-dating-family-fields` - 测试约会目的和家庭计划字段保存
- `/test-profile-fields` - 查看所有用户资料字段

## 常见问题

### Q: 字段保存后仍然显示为null
A: 检查数据库字段是否存在，运行 `check_database_fields.sql` 脚本

### Q: API返回错误
A: 检查API权限和字段类型是否匹配

### Q: 页面跳转后数据丢失
A: 确保注册流程页面正确传递 `restart=true` 参数

## 相关文件

- `add_missing_fields.sql` - 添加缺失字段的脚本
- `check_database_fields.sql` - 检查数据库字段的脚本
- `app/test-dating-family-fields/page.tsx` - 测试页面
- `app/api/user/profile/route.ts` - 用户资料更新API
- `app/dating-goals/page.tsx` - 约会目的页面
- `app/family-plans/page.tsx` - 家庭计划页面 