# Supabase Storage 设置指南

## 🚨 重要：手动设置存储桶

由于 Supabase Storage 的权限限制，我们需要手动在 Supabase 控制台中创建存储桶和设置权限策略。

## 📋 步骤 1：创建存储桶

1. **登录 Supabase 控制台**
   - 访问：https://supabase.com/dashboard
   - 选择您的项目

2. **进入 Storage 页面**
   - 在左侧菜单中点击 "Storage"
   - 点击 "Create a new bucket"

3. **创建存储桶**
   - **Bucket name**: `user-photos`
   - **Public bucket**: ✅ 勾选（允许公开访问）
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`
   - 点击 "Create bucket"

## 📋 步骤 2：设置存储策略

### 策略 1：允许用户上传自己的照片

1. **在 Storage 页面中**
   - 点击刚创建的 `user-photos` 存储桶
   - 点击 "Policies" 标签页
   - 点击 "New Policy"

2. **创建 INSERT 策略**
   - **Policy name**: `Users can upload their own photos`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
   ```sql
   (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
   - 点击 "Review" 然后 "Save policy"

### 策略 2：允许公开读取照片

1. **创建 SELECT 策略**
   - **Policy name**: `Anyone can view photos`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:
   ```sql
   (bucket_id = 'user-photos')
   ```
   - 点击 "Review" 然后 "Save policy"

### 策略 3：允许用户删除自己的照片

1. **创建 DELETE 策略**
   - **Policy name**: `Users can delete their own photos`
   - **Allowed operation**: `DELETE`
   - **Policy definition**:
   ```sql
   (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
   - 点击 "Review" 然后 "Save policy"

## 📋 步骤 3：更新 API 代码

由于存储桶创建失败，我们需要修改 API 代码，让它不尝试创建存储桶，而是直接使用已存在的存储桶。
 