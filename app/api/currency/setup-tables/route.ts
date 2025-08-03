import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('开始设置桃花币系统数据库表...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = [];

    // 1. 检查用户钱包表是否存在
    try {
      const { error } = await supabase
        .from('user_wallets')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        results.push({ 
          table: 'user_wallets', 
          status: 'missing', 
          message: '表不存在，需要在Supabase控制台创建' 
        });
      } else {
        results.push({ 
          table: 'user_wallets', 
          status: 'exists', 
          message: '表已存在' 
        });
      }
    } catch (err) {
      results.push({ 
        table: 'user_wallets', 
        status: 'error', 
        message: '检查失败: ' + (err instanceof Error ? err.message : '未知错误') 
      });
    }

    // 2. 检查货币交易表是否存在
    try {
      const { error } = await supabase
        .from('currency_transactions')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        results.push({ 
          table: 'currency_transactions', 
          status: 'missing', 
          message: '表不存在，需要在Supabase控制台创建' 
        });
      } else {
        results.push({ 
          table: 'currency_transactions', 
          status: 'exists', 
          message: '表已存在' 
        });
      }
    } catch (err) {
      results.push({ 
        table: 'currency_transactions', 
        status: 'error', 
        message: '检查失败: ' + (err instanceof Error ? err.message : '未知错误') 
      });
    }

    // 3. 检查礼物记录表是否存在
    try {
      const { error } = await supabase
        .from('gift_records')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        results.push({ 
          table: 'gift_records', 
          status: 'missing', 
          message: '表不存在，需要在Supabase控制台创建' 
        });
      } else {
        results.push({ 
          table: 'gift_records', 
          status: 'exists', 
          message: '表已存在' 
        });
      }
    } catch (err) {
      results.push({ 
        table: 'gift_records', 
        status: 'error', 
        message: '检查失败: ' + (err instanceof Error ? err.message : '未知错误') 
      });
    }

    const missingTables = results.filter(r => r.status === 'missing');
    const existingTables = results.filter(r => r.status === 'exists');

    return NextResponse.json({
      success: true,
      message: `检查完成。${existingTables.length}个表已存在，${missingTables.length}个表缺失`,
      results,
      missingTables,
      existingTables,
      sqlCommands: missingTables.length > 0 ? getSQLCommands() : null
    });

  } catch (error) {
    console.error('设置数据库表时出错:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

function getSQLCommands() {
  return `
-- 请在Supabase控制台的SQL编辑器中执行以下命令：

-- 1. 创建用户钱包表
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

-- 2. 创建货币交易表
CREATE TABLE IF NOT EXISTS currency_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id VARCHAR(100),
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建礼物记录表
CREATE TABLE IF NOT EXISTS gift_records (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  gift_type VARCHAR(50) NOT NULL,
  gift_name VARCHAR(100) NOT NULL,
  gift_cost INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created_at ON currency_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_gift_records_sender_id ON gift_records(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_records_receiver_id ON gift_records(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gift_records_created_at ON gift_records(created_at);
  `.trim();
} 