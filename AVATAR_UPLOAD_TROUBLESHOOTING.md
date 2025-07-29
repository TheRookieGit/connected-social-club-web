# 头像上传故障排除指南

## 🔍 问题诊断步骤

### 1. 使用诊断工具

访问以下页面来诊断问题：
- **API诊断**: `/test-avatar-api`
- **上传测试**: `/test-avatar-upload`

### 2. 常见问题及解决方案

#### 问题1: Supabase Storage未设置

**症状**:
- 上传时出现"文件上传失败"错误
- 错误信息包含"bucket not found"或类似内容

**解决方案**:
1. 登录Supabase Dashboard
2. 进入SQL Editor
3. 运行 `setup_avatar_storage.sql` 中的所有SQL语句
4. 验证存储桶创建成功

#### 问题2: 环境变量未配置

**症状**:
- API返回500错误
- 错误信息包含"数据库连接失败"

**解决方案**:
1. 在Vercel Dashboard中检查环境变量
2. 确保以下变量已设置：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

#### 问题3: 用户未登录

**症状**:
- 上传时出现"未授权访问"错误
- 状态码401

**解决方案**:
1. 确保用户已登录
2. 检查localStorage中是否有有效的token
3. 重新登录获取新的token

#### 问题4: 文件格式不支持

**症状**:
- 上传时出现"只支持JPEG、PNG和WebP格式"错误

**解决方案**:
1. 确保文件是JPEG、PNG或WebP格式
2. 检查文件扩展名是否正确
3. 尝试转换文件格式

#### 问题5: 文件大小超限

**症状**:
- 上传时出现"文件大小不能超过5MB"错误

**解决方案**:
1. 压缩图片文件
2. 使用在线工具减小文件大小
3. 选择更小的图片

#### 问题6: 网络连接问题

**症状**:
- 上传超时
- 网络错误

**解决方案**:
1. 检查网络连接
2. 尝试使用不同的网络
3. 清除浏览器缓存

## 🛠️ 手动检查步骤

### 1. 检查Supabase设置

在Supabase SQL Editor中运行：

```sql
-- 检查存储桶
SELECT * FROM storage.buckets WHERE id = 'user-avatars';

-- 检查存储策略
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';

-- 检查用户表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'avatar_url';
```

### 2. 检查Vercel环境变量

在Vercel Dashboard中：
1. 进入项目设置
2. 查看Environment Variables
3. 确保所有必要的变量都已设置

### 3. 检查浏览器控制台

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 查看Network标签页的请求状态

### 4. 检查API响应

使用诊断工具 `/test-avatar-api` 来：
1. 测试API端点是否可访问
2. 检查环境变量配置
3. 查看详细的错误信息

## 📋 完整的设置检查清单

### Supabase设置
- [ ] 存储桶 `user-avatars` 已创建
- [ ] 存储策略已设置
- [ ] 用户表有 `avatar_url` 字段
- [ ] 用户活动日志表存在

### Vercel设置
- [ ] 环境变量已配置
- [ ] 项目已部署成功
- [ ] API路由可访问

### 前端设置
- [ ] 用户已登录
- [ ] Token有效
- [ ] 文件格式正确
- [ ] 文件大小在限制内

## 🔧 高级故障排除

### 1. 检查API日志

在Vercel Dashboard中：
1. 进入Functions标签页
2. 查看 `/api/user/upload-avatar` 的日志
3. 分析错误信息

### 2. 测试数据库连接

使用 `/api/test-db` 端点测试：
1. 数据库连接是否正常
2. 环境变量是否正确
3. 权限是否足够

### 3. 检查存储权限

在Supabase中：
1. 进入Storage设置
2. 检查bucket权限
3. 验证RLS策略

## 🚨 紧急修复

如果所有方法都失败，尝试以下步骤：

1. **重新设置Supabase Storage**:
   ```sql
   -- 删除现有bucket
   DELETE FROM storage.buckets WHERE id = 'user-avatars';
   
   -- 重新创建
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES ('user-avatars', 'user-avatars', true, 5242880, 
           ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
   ```

2. **重新部署应用**:
   ```bash
   vercel --prod
   ```

3. **清除浏览器数据**:
   - 清除localStorage
   - 清除缓存
   - 重新登录

## 📞 获取帮助

如果问题仍然存在：

1. 查看浏览器控制台错误信息
2. 检查Vercel函数日志
3. 运行诊断工具获取详细信息
4. 提供错误信息和诊断结果

## 🔄 测试流程

1. 访问 `/test-avatar-api` 进行基础测试
2. 访问 `/test-avatar-upload` 进行完整测试
3. 在个人资料页面测试实际功能
4. 验证头像是否正确显示

---

**记住**: 大多数问题都与Supabase Storage设置或环境变量配置有关。按照上述步骤逐一检查，通常可以解决问题。 