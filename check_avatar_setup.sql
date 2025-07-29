-- 检查头像上传功能设置状态
-- 在 Supabase SQL Editor 中运行

-- 1. 检查存储桶是否存在
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'user-avatars';

-- 2. 检查存储策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';

-- 3. 检查用户表是否有avatar_url字段
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'avatar_url';

-- 4. 检查是否有用户活动日志表
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_activity_logs';

-- 5. 检查用户活动日志表结构
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_activity_logs';

-- 6. 检查是否有任何头像上传记录
SELECT 
  user_id,
  activity_type,
  activity_data,
  created_at
FROM user_activity_logs 
WHERE activity_type = 'avatar_upload'
ORDER BY created_at DESC
LIMIT 5;

-- 7. 检查存储桶中的文件
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'user-avatars'
ORDER BY created_at DESC
LIMIT 10; 