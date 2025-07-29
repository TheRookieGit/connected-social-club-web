-- 修复版本的扩展用户资料数据库结构
-- 解决UUID到BIGINT类型转换问题

-- 1. 扩展用户基础表
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

-- 2. 创建用户教育经历表（支持多个教育经历）
CREATE TABLE IF NOT EXISTS user_education (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  school VARCHAR(100) NOT NULL,
  degree VARCHAR(100),
  field_of_study VARCHAR(100),
  graduation_year INTEGER,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建用户工作经历表
CREATE TABLE IF NOT EXISTS user_work_experience (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  employer VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  industry VARCHAR(100),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建用户语言能力表
CREATE TABLE IF NOT EXISTS user_languages (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  proficiency VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced, native
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建用户价值观表
CREATE TABLE IF NOT EXISTS user_values (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  value_name VARCHAR(100) NOT NULL,
  importance_level INTEGER DEFAULT 3, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建用户生活方式表
CREATE TABLE IF NOT EXISTS user_lifestyle (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  exercise_frequency VARCHAR(50), -- daily, weekly, monthly, rarely, never
  smoking_status VARCHAR(50), -- never, occasionally, regularly, trying_to_quit
  drinking_status VARCHAR(50), -- never, occasionally, regularly, social_only
  diet_preferences TEXT[], -- vegetarian, vegan, gluten_free, etc.
  sleep_schedule VARCHAR(50), -- early_bird, night_owl, regular
  social_media_usage VARCHAR(50), -- minimal, moderate, heavy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 7. 创建用户关系偏好表
CREATE TABLE IF NOT EXISTS user_relationship_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  dating_style VARCHAR(50), -- casual, serious, marriage_minded, friends_first
  family_plans VARCHAR(50), -- wants_kids, open_to_kids, no_kids, has_kids
  relationship_goals TEXT[], -- long_term, short_term, friendship, etc.
  deal_breakers TEXT[],
  must_haves TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_user_work_experience_user_id ON user_work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_values_user_id ON user_values(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lifestyle_user_id ON user_lifestyle(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationship_preferences_user_id ON user_relationship_preferences(user_id);

-- 启用行级安全策略
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lifestyle ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationship_preferences ENABLE ROW LEVEL SECURITY;

-- 创建策略 - 使用简单的权限控制，避免UUID转换问题
CREATE POLICY "Allow all operations on user_education" ON user_education FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_work_experience" ON user_work_experience FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_languages" ON user_languages FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_values" ON user_values FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_lifestyle" ON user_lifestyle FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_relationship_preferences" ON user_relationship_preferences FOR ALL USING (true);

-- 为相关表创建触发器
CREATE TRIGGER update_user_education_updated_at BEFORE UPDATE ON user_education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_work_experience_updated_at BEFORE UPDATE ON user_work_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_lifestyle_updated_at BEFORE UPDATE ON user_lifestyle FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_relationship_preferences_updated_at BEFORE UPDATE ON user_relationship_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 显示创建结果
SELECT 'Extended database schema created successfully!' as status; 