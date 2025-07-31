-- 桃花币系统基础表创建

-- 1. 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 货币交易表
CREATE TABLE IF NOT EXISTS currency_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'gift_send', 'gift_receive'
    description TEXT,
    reference_id VARCHAR(100), -- 关联的订单ID或其他引用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 货币规则表
CREATE TABLE IF NOT EXISTS currency_rules (
    id SERIAL PRIMARY KEY,
    rule_code VARCHAR(100) UNIQUE NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户货币收益表
CREATE TABLE IF NOT EXISTS user_currency_earnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    rule_id INTEGER NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, rule_id, DATE(earned_at))
);

-- 5. 货币商品表
CREATE TABLE IF NOT EXISTS currency_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 用户购买表
CREATE TABLE IF NOT EXISTS user_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 礼物表
CREATE TABLE IF NOT EXISTS gifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 礼物交易表
CREATE TABLE IF NOT EXISTS gift_transactions (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    gift_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created_at ON currency_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_currency_earnings_user_id ON user_currency_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender_id ON gift_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver_id ON gift_transactions(receiver_id);

-- 插入默认数据
INSERT INTO currency_rules (rule_code, rule_name, description, amount) VALUES
('daily_login', '每日登录', '每日首次登录获得10个桃花币', 10),
('profile_complete', '完善资料', '完善个人资料获得20个桃花币', 20),
('first_match', '首次匹配', '获得首次匹配奖励50个桃花币', 50),
('send_message', '发送消息', '发送消息获得2个桃花币', 2)
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO currency_products (name, description, price, category) VALUES
('超级曝光', '让你的资料在搜索结果中优先显示24小时', 100, 'visibility'),
('消息提醒', '获得消息提醒功能7天', 50, 'feature'),
('匹配加速', '提高匹配成功率24小时', 80, 'matching'),
('VIP标识', '显示VIP标识7天', 200, 'status')
ON CONFLICT DO NOTHING;

INSERT INTO gifts (name, description, price, icon_url) VALUES
('玫瑰花', '表达爱意的经典礼物', 10, '/gifts/rose.png'),
('爱心', '简单而温暖的爱心', 5, '/gifts/heart.png'),
('钻石', '珍贵的钻石礼物', 50, '/gifts/diamond.png'),
('皇冠', '尊贵的皇冠礼物', 100, '/gifts/crown.png')
ON CONFLICT DO NOTHING; 