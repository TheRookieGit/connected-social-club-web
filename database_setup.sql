-- 社交俱乐部数据库设置脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建用户表
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有操作，实际应用中应该更严格）
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);

-- 插入测试用户数据（可选）
INSERT INTO users (email, password, name, phone, birth_date, gender) VALUES
('test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '测试用户', '+8613800138000', '1990-01-01', 'male'),
('admin@socialclub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理员', '+8613900139000', '1985-05-15', 'female');

-- 显示创建结果
SELECT 'Database setup completed successfully!' as status; 