-- 检查数据库字段是否存在
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 检查users表中的字段
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('dating_style', 'relationship_goals', 'family_plans', 'has_kids')
ORDER BY column_name;

-- 2. 检查user_relationship_preferences表是否存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_relationship_preferences';

-- 3. 如果user_relationship_preferences表存在，检查其字段
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_relationship_preferences'
ORDER BY column_name;

-- 4. 显示当前用户数据示例（如果有的话）
SELECT 
  id,
  name,
  dating_style,
  relationship_goals,
  family_plans,
  has_kids
FROM users 
LIMIT 5; 