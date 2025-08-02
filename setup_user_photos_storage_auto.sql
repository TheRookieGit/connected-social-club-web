-- 自动设置用户照片存储系统
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 添加photos字段到users表（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_photos ON users USING GIN (photos);

-- 3. 更新现有用户的photos字段为空数组（如果为null）
UPDATE users SET photos = '[]'::jsonb WHERE photos IS NULL;

-- 4. 创建用户照片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own photos folder" ON storage.objects;

-- 6. 创建存储策略 - 允许用户上传自己的照片
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. 创建存储策略 - 允许所有人查看照片（因为bucket是public的）
CREATE POLICY "Anyone can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'user-photos');

-- 8. 创建存储策略 - 允许用户删除自己的照片
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 9. 创建存储策略 - 允许用户管理自己的照片文件夹
CREATE POLICY "Users can manage their own photos folder" ON storage.objects
FOR ALL USING (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 10. 创建用户活动日志表（如果不存在）
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 创建活动日志索引
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- 12. 验证存储桶创建成功
SELECT 
  'Storage bucket created successfully!' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'user-photos';

-- 13. 显示所有存储策略
SELECT 
  'Storage policies created successfully!' as status,
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%photos%';

-- 14. 显示数据库设置结果
SELECT 
  'Database setup completed!' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN photos IS NOT NULL AND jsonb_array_length(photos) > 0 THEN 1 END) as users_with_photos
FROM users;

-- 15. 显示当前有照片的用户
SELECT 
  'Users with photos:' as info,
  id,
  name,
  email,
  jsonb_array_length(photos) as photo_count
FROM users 
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0
ORDER BY photo_count DESC; 