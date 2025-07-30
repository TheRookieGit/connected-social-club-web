-- 数据库字段修复脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 添加扩展字段到users表
ALTER TABLE users ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS religion VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employer VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS school VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS degree VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS values_preferences TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hometown VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS family_plans VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_kids BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS exercise_frequency VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS drinking_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS dating_style VARCHAR(50);

-- 2. 添加位置相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_accuracy DECIMAL(8, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

-- 3. 确保user_interests表存在
CREATE TABLE IF NOT EXISTS user_interests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  interest VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 确保user_preferences表存在
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 99,
  preferred_gender VARCHAR(10)[],
  max_distance INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

-- 6. 启用行级安全策略
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 7. 创建安全策略
DROP POLICY IF EXISTS "Allow all operations" ON user_interests;
CREATE POLICY "Allow all operations" ON user_interests FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON user_preferences;
CREATE POLICY "Allow all operations" ON user_preferences FOR ALL USING (true);

-- 8. 创建触发器函数来更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 为user_preferences表创建触发器
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！
SELECT 'Database schema fixed successfully!' as status; 