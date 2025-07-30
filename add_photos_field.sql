-- 添加photos字段到users表
-- 用于存储用户上传的照片URL数组

ALTER TABLE users ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_photos ON users USING GIN (photos);

-- 更新现有用户的photos字段为空数组（如果为null）
UPDATE users SET photos = '[]'::jsonb WHERE photos IS NULL;

-- 显示更新结果
SELECT 'Photos field added successfully!' as status; 