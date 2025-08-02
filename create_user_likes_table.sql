-- 创建用户喜欢关系表
CREATE TABLE IF NOT EXISTS user_likes (
  id BIGSERIAL PRIMARY KEY,
  liker_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  liked_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_likes_liker_id ON user_likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_liked_id ON user_likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_created_at ON user_likes(created_at);

-- 添加注释
COMMENT ON TABLE user_likes IS '用户喜欢关系表，记录用户之间的喜欢关系';
COMMENT ON COLUMN user_likes.liker_id IS '喜欢者的用户ID';
COMMENT ON COLUMN user_likes.liked_id IS '被喜欢者的用户ID';
COMMENT ON COLUMN user_likes.created_at IS '喜欢关系创建时间'; 