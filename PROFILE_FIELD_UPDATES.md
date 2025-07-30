# 个人资料编辑表单字段更新

## 📋 更新概述

根据用户要求，对个人资料编辑表单进行了以下修改：

### 1. 删除的字段
- **家乡** (hometown) - 已完全移除
- **婚姻状况** (marital_status) - 已完全移除  
- **运动** (exercise_frequency) - 已完全移除

### 2. 更新的字段选项

#### 吸烟状态 (smoking_status)
**原选项：**
- 从不
- 偶尔
- 经常
- 正在戒烟

**新选项（对应注册流程）：**
- `yes_smoke` - 是的，我吸烟
- `sometimes_smoke` - 我有时吸烟
- `no_smoke` - 不，我不吸烟
- `trying_quit` - 我正在尝试戒烟

#### 饮酒状态 (drinking_status)
**原选项：**
- 从不
- 偶尔
- 经常
- 仅社交场合

**新选项（对应注册流程）：**
- `yes_drink` - 是的，我喝酒
- `sometimes_drink` - 我有时喝酒
- `rarely_drink` - 我很少喝酒
- `no_drink` - 不，我不喝酒
- `sober` - 我戒酒了

#### 家庭计划 (family_plans)
**原选项：**
- 想要孩子
- 对孩子开放
- 不想要孩子
- 已有孩子

**新选项（对应注册流程）：**
- `dont_want_kids` - 不想要孩子
- `open_to_kids` - 对孩子持开放态度
- `want_kids` - 想要孩子
- `not_sure` - 不确定

#### 孩子 (has_kids)
**原选项：**
- 布尔值：true/false

**新选项（对应注册流程）：**
- `dont_have_kids` - 没有孩子
- `have_kids` - 有孩子

#### 约会风格 (dating_style)
**原选项：**
- 随意
- 认真
- 以结婚为目的
- 先做朋友

**新选项（对应注册流程中的"你希望寻找什么类型的关系"）：**
- `long_term` - 长期关系
- `life_partner` - 人生伴侣
- `casual_dates` - 有趣的随意约会
- `intimacy_no_commitment` - 肉体关系
- `marriage` - 婚姻
- `ethical_non_monogamy` - 开放式关系

## 🔧 技术实现

### 前端更改
1. **ProfileModal.tsx**
   - 删除了家乡、婚姻状况、运动字段的UI组件
   - 更新了所有字段的选项值以匹配注册流程
   - 添加了选项值到中文显示的映射函数

### 后端更改
1. **API路由 (app/api/user/profile/route.ts)**
   - 从允许更新的字段列表中移除了 `hometown`、`marital_status`、`exercise_frequency`
   - 保留了其他字段的更新逻辑

### 类型定义更改
1. **types/user.ts**
   - 从 `User` 接口中移除了 `hometown`、`marital_status`、`exercise_frequency` 字段
   - 将 `has_kids` 类型从 `boolean` 改为 `string | boolean` 以支持字符串值
   - 从 `ProfileOptions` 接口中移除了相应的选项数组

### 数据库更改
1. **remove_deleted_fields.sql**
   - 创建了SQL脚本来删除已移除的数据库字段
   - 更新了 `has_kids` 字段类型以支持字符串值
   - 提供了数据迁移逻辑

## 📊 字段映射

### 显示映射
所有字段都添加了从数据库值到中文显示的映射：

```typescript
const smokingMap: { [key: string]: string } = {
  'yes_smoke': '是的，我吸烟',
  'sometimes_smoke': '我有时吸烟',
  'no_smoke': '不，我不吸烟',
  'trying_quit': '我正在尝试戒烟'
}
```

### 数据一致性
- 所有选项值现在与注册流程完全一致
- 用户在选择这些字段时会看到与注册时相同的选项
- 数据库存储的值与注册流程使用的值保持一致

## 🚀 部署步骤

1. **运行数据库迁移**
   ```sql
   -- 在Supabase SQL Editor中运行
   -- 执行 remove_deleted_fields.sql 文件
   ```

2. **重启应用**
   - 确保所有更改已部署到生产环境

3. **验证功能**
   - 测试个人资料编辑功能
   - 确认所有字段选项正确显示
   - 验证数据保存和读取功能

## ✅ 验证清单

- [ ] 家乡字段已从表单中移除
- [ ] 婚姻状况字段已从表单中移除
- [ ] 运动字段已从表单中移除
- [ ] 吸烟状态选项已更新为注册流程选项
- [ ] 饮酒状态选项已更新为注册流程选项
- [ ] 家庭计划选项已更新为注册流程选项
- [ ] 孩子选项已更新为注册流程选项
- [ ] 约会风格选项已更新为注册流程选项
- [ ] 所有字段的显示映射正常工作
- [ ] 数据保存和读取功能正常
- [ ] 数据库迁移已成功执行 