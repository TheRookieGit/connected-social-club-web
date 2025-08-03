-- 核心货币系统数据库设计
-- 桃花币 (Peach Blossom Coins) 系统

-- 1. 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL,
  total_earned INTEGER DEFAULT 0 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 交易记录表
CREATE TABLE IF NOT EXISTS currency_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'gift', 'refund'
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id VARCHAR(100), -- 关联的业务ID（如消息ID、匹配ID等）
  reference_type VARCHAR(50), -- 关联的业务类型
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 货币获取规则表
CREATE TABLE IF NOT EXISTS currency_rules (
  id BIGSERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'daily', 'one_time', 'achievement', 'referral'
  amount INTEGER NOT NULL,
  max_daily_limit INTEGER DEFAULT 1, -- 每日最大获取次数
  max_total_limit INTEGER, -- 总获取次数限制（null表示无限制）
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户货币获取记录表
CREATE TABLE IF NOT EXISTS user_currency_earnings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  rule_id BIGINT REFERENCES currency_rules(id),
  amount INTEGER NOT NULL,
  earned_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, rule_id, earned_date)
);

-- 5. 货币消费项目表
CREATE TABLE IF NOT EXISTS currency_products (
  id BIGSERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  product_type VARCHAR(50) NOT NULL, -- 'feature', 'boost', 'gift', 'premium'
  price INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 用户购买记录表
CREATE TABLE IF NOT EXISTS user_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES currency_products(id),
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- 如果是限时功能
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 礼物系统表
CREATE TABLE IF NOT EXISTS gifts (
  id BIGSERIAL PRIMARY KEY,
  gift_name VARCHAR(100) NOT NULL,
  gift_type VARCHAR(50) NOT NULL, -- 'emoji', 'sticker', 'animation', 'special'
  price INTEGER NOT NULL,
  icon_url VARCHAR(255),
  animation_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 礼物发送记录表
CREATE TABLE IF NOT EXISTS gift_transactions (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  gift_id BIGINT REFERENCES gifts(id),
  amount INTEGER NOT NULL,
  message TEXT,
  conversation_id BIGINT, -- 关联的对话ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_type ON currency_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created_at ON currency_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_currency_earnings_user_id ON user_currency_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_currency_earnings_date ON user_currency_earnings(earned_date);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender_id ON gift_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver_id ON gift_transactions(receiver_id);

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currency_rules_updated_at BEFORE UPDATE ON currency_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currency_products_updated_at BEFORE UPDATE ON currency_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认货币获取规则
INSERT INTO currency_rules (rule_name, rule_type, amount, max_daily_limit, description) VALUES
('每日登录', 'daily', 10, 1, '每日首次登录获得10个桃花币'),
('完善资料', 'one_time', 50, 1, '完善个人资料获得50个桃花币'),
('上传头像', 'one_time', 20, 1, '上传头像获得20个桃花币'),
('上传照片', 'one_time', 30, 1, '上传照片获得30个桃花币'),
('成功匹配', 'one_time', 25, 10, '每次成功匹配获得25个桃花币'),
('发送消息', 'daily', 5, 20, '每日发送消息获得5个桃花币（最多20次）'),
('收到消息', 'daily', 3, 30, '每日收到消息获得3个桃花币（最多30次）'),
('推荐好友', 'one_time', 100, 5, '成功推荐好友注册获得100个桃花币'),
('连续登录', 'achievement', 50, 1, '连续登录7天获得50个桃花币'),
('活跃用户', 'achievement', 200, 1, '成为活跃用户获得200个桃花币')
ON CONFLICT (rule_name) DO NOTHING;

-- 插入默认消费项目
INSERT INTO currency_products (product_name, product_type, price, description) VALUES
('超级喜欢', 'feature', 50, '发送超级喜欢，让对方优先看到你的资料'),
('重新匹配', 'feature', 30, '重新匹配已拒绝的用户'),
('查看谁喜欢我', 'feature', 100, '查看所有喜欢你的用户'),
('无限滑动', 'boost', 200, '24小时内无限次滑动'),
('优先展示', 'boost', 150, '在匹配列表中优先展示你的资料'),
('消息提醒', 'feature', 80, '获得消息即时提醒功能'),
('高级筛选', 'feature', 120, '使用高级筛选条件'),
('隐身模式', 'feature', 300, '浏览资料时不被发现')
ON CONFLICT (product_name) DO NOTHING;

-- 插入默认礼物
INSERT INTO gifts (gift_name, gift_type, price, icon_url) VALUES
('玫瑰', 'emoji', 10, '/gifts/rose.png'),
('爱心', 'emoji', 5, '/gifts/heart.png'),
('星星', 'emoji', 8, '/gifts/star.png'),
('蛋糕', 'emoji', 15, '/gifts/cake.png'),
('钻石', 'special', 50, '/gifts/diamond.png'),
('皇冠', 'special', 100, '/gifts/crown.png'),
('烟花', 'animation', 30, '/gifts/fireworks.png'),
('彩虹', 'animation', 25, '/gifts/rainbow.png')
ON CONFLICT (gift_name) DO NOTHING; 