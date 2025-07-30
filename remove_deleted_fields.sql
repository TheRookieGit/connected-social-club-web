-- 删除已移除的字段
-- 从用户表中删除家乡、婚姻状况、运动频率字段

-- 删除家乡字段
ALTER TABLE users DROP COLUMN IF EXISTS hometown;

-- 删除婚姻状况字段
ALTER TABLE users DROP COLUMN IF EXISTS marital_status;

-- 删除运动频率字段
ALTER TABLE users DROP COLUMN IF EXISTS exercise_frequency;

-- 更新has_kids字段类型以支持字符串值
-- 首先创建一个临时列
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_kids_new VARCHAR(50);

-- 将现有的布尔值转换为字符串
UPDATE users SET has_kids_new = 
  CASE 
    WHEN has_kids = true THEN 'have_kids'
    WHEN has_kids = false THEN 'dont_have_kids'
    ELSE NULL
  END
WHERE has_kids IS NOT NULL;

-- 删除旧列并重命名新列
ALTER TABLE users DROP COLUMN IF EXISTS has_kids;
ALTER TABLE users RENAME COLUMN has_kids_new TO has_kids;

-- 验证更改
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('hometown', 'marital_status', 'exercise_frequency', 'has_kids'); 