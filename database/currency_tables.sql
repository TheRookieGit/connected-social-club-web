-- 桃花币系统数据库表结构

-- 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_earned DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 货币交易记录表
CREATE TABLE IF NOT EXISTS currency_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'gift', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id VARCHAR(100),
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 货币获取规则表
CREATE TABLE IF NOT EXISTS currency_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  max_daily INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 商品表
CREATE TABLE IF NOT EXISTS currency_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 礼物表
CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 礼物发送记录表
CREATE TABLE IF NOT EXISTS gift_transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gift_id INTEGER NOT NULL REFERENCES gifts(id),
  amount INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created_at ON currency_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender_id ON gift_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver_id ON gift_transactions(receiver_id);

-- 插入默认数据
INSERT INTO currency_rules (rule_name, rule_description, amount, max_daily) VALUES
('每日登录', '每日首次登录获得桃花币', 10, 1),
('完善资料', '完善个人资料获得桃花币', 50, 1),
('上传照片', '上传个人照片获得桃花币', 20, 5),
('匹配成功', '与用户匹配成功获得桃花币', 30, 10),
('收到礼物', '收到其他用户赠送的礼物', 5, 100)
ON CONFLICT DO NOTHING;

INSERT INTO currency_products (name, description, price, original_price) VALUES
('超级喜欢', '发送超级喜欢，让对方更容易注意到你', 50, 60),
('重新匹配', '重新匹配一次，获得更多推荐', 30, 40),
('查看谁喜欢我', '查看哪些用户喜欢了你', 100, 120),
('无限滑动', '24小时内无限次滑动', 80, 100),
('优先推荐', '让你的资料优先被推荐给其他用户', 150, 200)
ON CONFLICT DO NOTHING;

INSERT INTO gifts (name, description, price) VALUES
('玫瑰', '美丽的玫瑰花', 10),
('爱心', '温暖的爱心', 20),
('钻石', '闪耀的钻石', 50),
('皇冠', '高贵的皇冠', 100),
('星星', '闪亮的星星', 30)
ON CONFLICT DO NOTHING; 