-- 地理位置功能数据库架构扩展
-- 在 Supabase SQL Editor 中运行

-- 1. 为 users 表添加位置相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_accuracy DECIMAL(8, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

-- 2. 创建位置索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_location_updated ON users(location_updated_at);
CREATE INDEX IF NOT EXISTS idx_users_online_location ON users(is_online, latitude, longitude);

-- 3. 创建位置历史记录表
CREATE TABLE IF NOT EXISTS user_location_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 为位置历史表创建索引
CREATE INDEX IF NOT EXISTS idx_location_history_user ON user_location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_created ON user_location_history(created_at);

-- 5. 创建位置隐私设置表
CREATE TABLE IF NOT EXISTS user_location_privacy (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  share_location BOOLEAN DEFAULT true,
  share_precision VARCHAR(20) DEFAULT 'exact', -- exact, approximate, city_only
  max_distance_visible INTEGER DEFAULT 50, -- 公里
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. 创建位置匹配偏好表
CREATE TABLE IF NOT EXISTS user_location_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  preferred_max_distance INTEGER DEFAULT 50, -- 公里
  preferred_min_distance INTEGER DEFAULT 0, -- 公里
  preferred_cities TEXT[], -- 偏好的城市列表
  avoid_cities TEXT[], -- 避免的城市列表
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 7. 创建位置相关的触发器函数
CREATE OR REPLACE FUNCTION update_location_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_location_updated_at ON users;
CREATE TRIGGER trigger_update_location_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude OR OLD.longitude IS DISTINCT FROM NEW.longitude)
  EXECUTE FUNCTION update_location_updated_at();

-- 9. 创建位置历史记录触发器函数
CREATE OR REPLACE FUNCTION log_location_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有当位置真正改变时才记录
  IF OLD.latitude IS DISTINCT FROM NEW.latitude OR OLD.longitude IS DISTINCT FROM NEW.longitude THEN
    INSERT INTO user_location_history (user_id, latitude, longitude, accuracy)
    VALUES (NEW.id, NEW.latitude, NEW.longitude, NEW.location_accuracy);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建位置历史记录触发器
DROP TRIGGER IF EXISTS trigger_log_location_change ON users;
CREATE TRIGGER trigger_log_location_change
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_location_change();

-- 11. 创建地理位置查询函数
CREATE OR REPLACE FUNCTION get_nearby_users(
  user_lat DECIMAL(10, 8),
  user_lon DECIMAL(11, 8),
  search_radius INTEGER DEFAULT 50,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id BIGINT,
  name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance_km DECIMAL(8, 2),
  is_online BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.avatar_url,
    u.bio,
    u.latitude,
    u.longitude,
    -- 使用 Haversine 公式计算距离
    (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(u.latitude)) * 
      cos(radians(u.longitude) - radians(user_lon)) + 
      sin(radians(user_lat)) * 
      sin(radians(u.latitude))
    ))::DECIMAL(8, 2) as distance_km,
    u.is_online
  FROM users u
  WHERE u.status = 'active'
    AND u.latitude IS NOT NULL
    AND u.longitude IS NOT NULL
    AND u.id != (SELECT id FROM users WHERE latitude = user_lat AND longitude = user_lon LIMIT 1)
    AND (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(u.latitude)) * 
      cos(radians(u.longitude) - radians(user_lon)) + 
      sin(radians(user_lat)) * 
      sin(radians(u.latitude))
    )) <= search_radius
  ORDER BY distance_km
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 12. 创建位置统计函数
CREATE OR REPLACE FUNCTION get_location_stats()
RETURNS TABLE (
  total_users_with_location INTEGER,
  online_users_with_location INTEGER,
  avg_location_accuracy DECIMAL(8, 2),
  most_active_city VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_users_with_location,
    COUNT(CASE WHEN is_online THEN 1 END)::INTEGER as online_users_with_location,
    AVG(location_accuracy)::DECIMAL(8, 2) as avg_location_accuracy,
    location as most_active_city
  FROM users 
  WHERE latitude IS NOT NULL 
    AND longitude IS NOT NULL
    AND status = 'active'
  GROUP BY location
  ORDER BY COUNT(*) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 13. 添加行级安全策略
ALTER TABLE user_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_location_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_location_preferences ENABLE ROW LEVEL SECURITY;

-- 14. 创建安全策略
-- 用户只能查看自己的位置历史
CREATE POLICY "Users can view own location history" ON user_location_history
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能管理自己的位置隐私设置
CREATE POLICY "Users can manage own location privacy" ON user_location_privacy
  FOR ALL USING (auth.uid() = user_id);

-- 用户只能管理自己的位置偏好
CREATE POLICY "Users can manage own location preferences" ON user_location_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 15. 创建位置数据清理函数（定期清理旧的位置历史）
CREATE OR REPLACE FUNCTION cleanup_old_location_history(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_location_history 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 16. 创建位置数据验证函数
CREATE OR REPLACE FUNCTION validate_location_coordinates(
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 检查坐标是否在有效范围内
  RETURN lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180;
END;
$$ LANGUAGE plpgsql;

-- 17. 添加约束
ALTER TABLE users ADD CONSTRAINT check_latitude_range 
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE users ADD CONSTRAINT check_longitude_range 
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- 18. 创建位置更新日志表（用于调试和监控）
CREATE TABLE IF NOT EXISTS location_update_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  old_latitude DECIMAL(10, 8),
  old_longitude DECIMAL(11, 8),
  new_latitude DECIMAL(10, 8),
  new_longitude DECIMAL(11, 8),
  update_source VARCHAR(50), -- 'manual', 'auto', 'api'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. 为日志表创建索引
CREATE INDEX IF NOT EXISTS idx_location_logs_user ON location_update_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_location_logs_created ON location_update_logs(created_at);

-- 20. 创建位置更新日志触发器
CREATE OR REPLACE FUNCTION log_location_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO location_update_logs (
    user_id, 
    old_latitude, 
    old_longitude, 
    new_latitude, 
    new_longitude,
    update_source
  ) VALUES (
    NEW.id,
    OLD.latitude,
    OLD.longitude,
    NEW.latitude,
    NEW.longitude,
    'api'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 21. 创建位置更新日志触发器
DROP TRIGGER IF EXISTS trigger_log_location_update ON users;
CREATE TRIGGER trigger_log_location_update
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude OR OLD.longitude IS DISTINCT FROM NEW.longitude)
  EXECUTE FUNCTION log_location_update();

-- 22. 创建示例数据（可选）
-- INSERT INTO user_location_privacy (user_id, share_location, share_precision, max_distance_visible)
-- SELECT id, true, 'exact', 50 FROM users WHERE id IN (1, 2, 3);

-- INSERT INTO user_location_preferences (user_id, preferred_max_distance, preferred_cities)
-- SELECT id, 30, ARRAY['北京', '上海', '深圳'] FROM users WHERE id IN (1, 2, 3);

-- 23. 创建位置相关的视图
CREATE OR REPLACE VIEW active_users_with_location AS
SELECT 
  id,
  name,
  avatar_url,
  bio,
  latitude,
  longitude,
  location_accuracy,
  location_updated_at,
  is_online,
  last_seen
FROM users
WHERE status = 'active'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location_updated_at > NOW() - INTERVAL '24 hours';

-- 24. 创建位置统计视图
CREATE OR REPLACE VIEW location_statistics AS
SELECT 
  COUNT(*) as total_users_with_location,
  COUNT(CASE WHEN is_online THEN 1 END) as online_users_with_location,
  AVG(location_accuracy) as average_accuracy,
  MAX(location_updated_at) as last_location_update
FROM users
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND status = 'active';

-- 完成！
-- 现在您的数据库已经支持完整的地理位置功能 