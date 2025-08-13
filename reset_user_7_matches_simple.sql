-- 简化版本：将用户ID=7的所有匹配分数重置为0

-- 更新用户7作为发起者的匹配记录
UPDATE user_matches 
SET match_score = 0, updated_at = NOW()
WHERE user_id = 7;

-- 更新用户7作为接收者的匹配记录  
UPDATE user_matches 
SET match_score = 0, updated_at = NOW()
WHERE matched_user_id = 7;

-- 验证结果
SELECT 
    '用户7的匹配记录已重置' as status,
    COUNT(*) as total_matches,
    COUNT(CASE WHEN match_score = 0 THEN 1 END) as zero_score_matches
FROM user_matches 
WHERE user_id = 7 OR matched_user_id = 7; 