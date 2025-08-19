-- 重置用户ID=7的所有匹配分数为0
-- 这个脚本会将用户7作为发起者或接收者的所有匹配记录的match_score设置为0

-- 1. 首先查看用户7当前的匹配记录
SELECT 
    '当前用户7的匹配记录' as info,
    id,
    user_id,
    matched_user_id,
    match_status,
    match_score,
    created_at
FROM user_matches 
WHERE user_id = 7 OR matched_user_id = 7
ORDER BY created_at DESC;

-- 2. 更新用户7作为发起者的所有匹配记录
UPDATE user_matches 
SET 
    match_score = 0,
    updated_at = NOW()
WHERE user_id = 7;

-- 3. 更新用户7作为接收者的所有匹配记录
UPDATE user_matches 
SET 
    match_score = 0,
    updated_at = NOW()
WHERE matched_user_id = 7;

-- 4. 验证更新结果
SELECT 
    '更新后的用户7匹配记录' as info,
    id,
    user_id,
    matched_user_id,
    match_status,
    match_score,
    updated_at
FROM user_matches 
WHERE user_id = 7 OR matched_user_id = 7
ORDER BY updated_at DESC;

-- 5. 统计更新数量
SELECT 
    '统计信息' as info,
    COUNT(*) as total_matches_for_user_7,
    COUNT(CASE WHEN match_score = 0 THEN 1 END) as matches_with_zero_score
FROM user_matches 
WHERE user_id = 7 OR matched_user_id = 7; 