# 照片同步问题解决方案

## 问题描述

用户在注册时上传了照片，但在用户照片页面中看不到这些照片。这是因为之前的照片上传系统存在以下问题：

1. **API字段过滤**：用户资料API的 `allowedFields` 中没有包含 `photos` 字段
2. **存储方式**：照片只是保存为base64字符串，没有真正上传到云存储
3. **数据库字段**：可能缺少 `photos` 字段

## 解决方案

### 1. 修复API字段过滤

已修复 `app/api/user/profile/route.ts` 中的 `allowedFields` 列表，添加了 `photos` 字段：

```typescript
const allowedFields = [
  // ... 其他字段
  'photos'  // 新增
]
```

### 2. 创建新的照片上传API

创建了 `app/api/user/upload-photos/route.ts`，提供真正的照片上传功能：

- 将照片上传到 Supabase Storage
- 支持多文件上传
- 文件类型和大小验证
- 返回照片URL而不是base64字符串

### 3. 更新照片上传页面

修改了 `app/photos/page.tsx`：

- 使用新的照片上传API
- 将base64照片转换为文件对象
- 改进错误处理

### 4. 数据库设置

运行 `setup_user_photos_storage.sql` 脚本来：

- 添加 `photos` 字段到 users 表
- 创建索引提高查询性能
- 设置默认值

## 测试步骤

### 1. 测试照片上传功能

访问 `/test-photo-upload` 页面：

1. 选择多张照片文件
2. 点击上传按钮
3. 检查上传结果
4. 验证照片URL是否正确

### 2. 测试照片显示功能

访问 `/user-photos` 页面：

1. 检查是否显示上传的照片
2. 测试照片点击放大功能
3. 验证照片导航功能

### 3. 测试注册流程

重新走一遍注册流程：

1. 完成注册步骤到照片上传页面
2. 上传3张或更多照片
3. 完成注册并跳转到仪表板
4. 检查照片是否正确保存

## 数据库设置

### 1. 运行数据库脚本

在 Supabase SQL Editor 中运行：

```sql
-- 运行 setup_user_photos_storage.sql 脚本
```

### 2. 创建存储桶

在 Supabase Storage 中创建 `user-photos` 存储桶：

- 名称：`user-photos`
- 公开访问：`true`
- 文件大小限制：`5MB`
- 允许的文件类型：`image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### 3. 设置存储策略

创建存储策略 "Users can upload their own photos"：

- 策略类型：`INSERT`
- 策略条件：`bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]`

## 验证修复

### 1. 检查数据库字段

```sql
-- 检查photos字段是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'photos';

-- 检查现有用户的photos字段
SELECT id, name, email, photos 
FROM users 
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0;
```

### 2. 检查API响应

调用 `/api/user/profile` API，检查响应中是否包含 `photos` 字段。

### 3. 检查存储桶

在 Supabase Storage 中检查 `user-photos` 存储桶是否创建成功，是否有文件上传。

## 常见问题

### Q: 为什么之前上传的照片没有显示？

A: 之前的上传系统只是将照片保存为base64字符串，没有真正上传到云存储。新的系统会将照片上传到 Supabase Storage 并保存URL。

### Q: 如何恢复之前上传的照片？

A: 如果之前有base64格式的照片数据，可以：
1. 从数据库备份中提取base64数据
2. 使用新的上传API重新上传这些照片
3. 或者手动将base64转换为文件并上传

### Q: 上传失败怎么办？

A: 检查以下几点：
1. 确保已登录（有有效的token）
2. 检查文件格式和大小是否符合要求
3. 确认 Supabase Storage 配置正确
4. 查看浏览器控制台和服务器日志

### Q: 照片显示不出来怎么办？

A: 检查以下几点：
1. 确认照片URL是否正确
2. 检查 Supabase Storage 的公开访问设置
3. 验证照片文件是否真实存在
4. 检查网络连接和CORS设置

## 部署检查清单

- [ ] 运行数据库脚本 `setup_user_photos_storage.sql`
- [ ] 创建 Supabase Storage 存储桶 `user-photos`
- [ ] 设置存储策略
- [ ] 测试照片上传功能 `/test-photo-upload`
- [ ] 测试照片显示功能 `/user-photos`
- [ ] 测试完整注册流程
- [ ] 验证现有用户数据

## 联系支持

如果遇到问题，请：

1. 检查浏览器控制台错误信息
2. 查看服务器日志
3. 确认环境变量配置
4. 验证数据库连接
5. 测试 Supabase Storage 权限 