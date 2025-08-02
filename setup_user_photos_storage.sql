-- 设置用户照片存储系统
-- 这个脚本会创建必要的数据库字段和存储桶

-- 1. 添加photos字段到users表（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_photos ON users USING GIN (photos);

-- 3. 更新现有用户的photos字段为空数组（如果为null）
UPDATE users SET photos = '[]'::jsonb WHERE photos IS NULL;

-- 4. 创建用户照片存储桶（需要在Supabase Storage中手动创建）
-- 存储桶名称: user-photos
-- 公开访问: true
-- 文件大小限制: 5MB
-- 允许的文件类型: image/jpeg, image/jpg, image/png, image/webp

-- 5. 创建存储策略（需要在Supabase Storage中手动设置）
-- 策略名称: "Users can upload their own photos"
-- 策略类型: INSERT
-- 策略条件: bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]

-- 6. 显示更新结果
SELECT 
  'Photos field setup completed!' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN photos IS NOT NULL AND jsonb_array_length(photos) > 0 THEN 1 END) as users_with_photos
FROM users;

-- 7. 显示当前有照片的用户
SELECT 
  id,
  name,
  email,
  jsonb_array_length(photos) as photo_count,
  photos
FROM users 
WHERE photos IS NOT NULL AND jsonb_array_length(photos) > 0
ORDER BY photo_count DESC; 