# Vercel 照片上传问题修复指南

## 问题描述

在Vercel部署环境中，照片上传功能可能出现以下错误：
1. **"Unexpected token 'R'"** - 服务器返回了非JSON格式的错误信息
2. **"Request Entity Too Large"** - 上传的文件大小超过了Vercel的函数限制
3. **"FUNCTION_PAYLOAD_TOO_LARGE"** - 请求体大小超过Vercel限制

## 问题原因分析

1. **环境变量配置问题**：Vercel中可能缺少必要的环境变量
2. **API路由错误处理不完善**：当服务器出错时，可能返回了非JSON格式的错误信息
3. **Supabase连接问题**：在Vercel环境中Supabase连接可能有问题
4. **存储桶权限问题**：user-photos存储桶可能不存在或权限配置错误
5. **文件大小限制**：Vercel的Serverless函数有4.5MB的默认请求体大小限制

## 解决方案

### 1. 检查Vercel环境变量

确保在Vercel项目设置中配置了以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 其他配置
NODE_ENV=production
```

### 2. 文件大小限制

**重要**：Vercel的Serverless函数有4.5MB的请求体大小限制，建议将文件大小限制设置为4MB以留有余量。

#### 前端文件大小检查
- 在选择文件时自动检查文件大小
- 如果文件超过4MB，显示错误提示
- 自动压缩大图片到合适大小

#### 后端文件大小验证
- API路由中严格验证文件大小
- 超过4MB的文件会被拒绝并返回详细错误信息

### 3. 图片压缩功能

应用现在包含自动图片压缩功能：
- 自动调整图片尺寸（最大1200x1200像素）
- 压缩图片质量（80%质量）
- 如果压缩后仍然过大，进一步降低质量到60%
- 保持图片的宽高比

### 4. 使用诊断工具

访问 `/test-photo-upload` 页面来运行诊断测试：

1. **运行环境测试**：检查环境变量和连接状态
2. **测试照片上传**：测试实际的照片上传功能
3. **测试文件大小限制**：测试不同大小文件的上传限制
4. 查看详细的错误信息和诊断结果

### 5. 手动创建存储桶

如果诊断显示存储桶不存在，可以手动在Supabase控制台中创建：

1. 登录Supabase控制台
2. 进入Storage页面
3. 创建名为`user-photos`的存储桶
4. 设置权限为public
5. 配置文件大小限制为4MB（不是5MB）
6. 允许的文件类型：image/jpeg, image/jpg, image/png, image/webp

### 6. 检查存储桶权限

确保`user-photos`存储桶有以下权限策略：

```sql
-- 允许任何人查看照片
CREATE POLICY "Anyone can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'user-photos');

-- 允许认证用户上传照片
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.role() = 'authenticated'
);

-- 允许用户删除自己的照片
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 7. 重新部署应用

在修复环境变量和存储桶配置后：

1. 在Vercel控制台中重新部署应用
2. 或者推送代码到Git仓库触发自动部署

### 8. 验证修复

部署完成后：

1. 访问 `/test-photo-upload` 页面
2. 运行所有诊断测试
3. 确认所有测试都通过
4. 测试实际的照片上传功能

## 常见错误及解决方案

### 错误1: "Unexpected token 'R'"

**原因**：服务器返回了非JSON格式的错误信息

**解决方案**：
- 检查环境变量是否正确配置
- 确保Supabase连接正常
- 查看服务器日志获取详细错误信息

### 错误2: "Request Entity Too Large" / "FUNCTION_PAYLOAD_TOO_LARGE"

**原因**：上传的文件大小超过了Vercel的函数限制

**解决方案**：
- 确保上传的文件小于4MB
- 使用应用内置的图片压缩功能
- 选择较小的图片文件

### 错误3: "存储桶不存在"

**原因**：user-photos存储桶未创建

**解决方案**：
- 在Supabase控制台中手动创建存储桶
- 或者使用诊断工具自动创建

### 错误4: "权限不足"

**原因**：存储桶权限策略配置错误

**解决方案**：
- 检查存储桶权限策略
- 确保用户有上传和查看权限

### 错误5: "环境变量缺失"

**原因**：Vercel中缺少必要的环境变量

**解决方案**：
- 在Vercel项目设置中添加所有必需的环境变量
- 重新部署应用

## 调试技巧

### 1. 查看Vercel日志

在Vercel控制台中查看函数日志：
1. 进入项目部署页面
2. 点击"Functions"标签
3. 查看API路由的执行日志

### 2. 使用浏览器开发者工具

1. 打开浏览器开发者工具
2. 进入Network标签
3. 尝试上传照片
4. 查看API请求的详细信息和响应

### 3. 检查环境变量

使用诊断工具检查环境变量是否正确设置：
```
GET /api/test-db?test=env
```

### 4. 测试Supabase连接

使用诊断工具测试Supabase连接：
```
GET /api/test-db?test=supabase
```

### 5. 测试文件大小限制

使用诊断工具测试文件大小限制：
```
访问 /test-photo-upload 页面
点击"测试文件大小限制"按钮
```

## 最佳实践

### 1. 图片优化
- 上传前压缩图片到合适大小
- 使用现代图片格式（WebP）
- 避免上传过大的原始图片

### 2. 用户体验
- 提供清晰的文件大小限制提示
- 自动压缩大图片
- 显示上传进度和状态

### 3. 错误处理
- 提供详细的错误信息
- 给出具体的解决建议
- 记录详细的错误日志

## 预防措施

1. **环境变量管理**：使用.env.local文件管理本地环境变量，确保与Vercel配置一致
2. **错误处理**：在所有API路由中添加完善的错误处理
3. **测试覆盖**：定期运行诊断测试确保功能正常
4. **监控日志**：定期检查Vercel函数日志发现潜在问题
5. **文件大小限制**：始终验证文件大小，避免超过平台限制

## 联系支持

如果问题仍然存在，请：

1. 收集诊断工具的完整输出
2. 提供Vercel函数日志
3. 描述具体的错误步骤
4. 提供环境信息（浏览器、操作系统等）
5. 提供上传文件的大小信息

---

**注意**：这个指南会随着问题的解决而更新。如果发现新的问题或解决方案，请及时更新此文档。 