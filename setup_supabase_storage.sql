-- Supabase Storage 权限策略设置脚本
-- 请在 Supabase SQL Editor 中运行此脚本

-- 注意：此脚本仅设置数据库级别的权限
-- 存储桶本身需要在 Supabase 控制台的 Storage 页面中手动创建

-- 1. 确保 photos 字段存在
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_photos ON users USING GIN (photos);

-- 3. 更新现有用户
UPDATE users SET photos = '[]'::jsonb WHERE photos IS NULL;

-- 4. 创建用户活动日志表（如果不存在）
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- 6. 显示设置结果
SELECT 
  'Database setup completed!' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN photos IS NOT NULL AND jsonb_array_length(photos) > 0 THEN 1 END) as users_with_photos
FROM users;

-- 7. 显示当前有照片的用户
SELECT 
  id,
  name,
  email,
  jsonb_array_length(photos) as photo_count
FROM users 
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0
ORDER BY photo_count DESC;

-- 重要提醒：
-- 1. 请在 Supabase 控制台的 Storage 页面中手动创建 'user-photos' 存储桶
-- 2. 设置存储桶为公开访问
-- 3. 设置文件大小限制为 5MB
-- 4. 设置允许的文件类型：image/jpeg, image/jpg, image/png, image/webp
-- 5. 在存储桶的 Policies 页面中设置以下策略：
--    - INSERT: (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--    - SELECT: (bucket_id = 'user-photos')
--    - DELETE: (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]) 