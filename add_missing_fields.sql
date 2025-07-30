-- 添加缺失的字段到users表
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 添加relationship_goals字段到users表
ALTER TABLE users ADD COLUMN IF NOT EXISTS relationship_goals TEXT[];

-- 2. 确保user_relationship_preferences表存在
CREATE TABLE IF NOT EXISTS user_relationship_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  dating_style VARCHAR(50),
  family_plans VARCHAR(50),
  relationship_goals TEXT[],
  deal_breakers TEXT[],
  must_haves TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_relationship_preferences_user_id ON user_relationship_preferences(user_id);

-- 4. 启用行级安全策略
ALTER TABLE user_relationship_preferences ENABLE ROW LEVEL SECURITY;

-- 5. 创建安全策略
DROP POLICY IF EXISTS "Allow all operations" ON user_relationship_preferences;
CREATE POLICY "Allow all operations" ON user_relationship_preferences FOR ALL USING (true);

-- 6. 创建触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 为user_relationship_preferences表创建触发器
DROP TRIGGER IF EXISTS update_user_relationship_preferences_updated_at ON user_relationship_preferences;
CREATE TRIGGER update_user_relationship_preferences_updated_at 
  BEFORE UPDATE ON user_relationship_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成！
SELECT 'Missing fields added successfully!' as status; 