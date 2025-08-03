import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('开始部署桃花币系统数据库表...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = [];

    // 1. 创建用户钱包表
    try {
      const { error } = await supabase
        .from('user_wallets')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('用户钱包表不存在，需要创建');
        results.push({ table: 'user_wallets', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('用户钱包表已存在');
        results.push({ table: 'user_wallets', success: true });
      }
    } catch (err) {
      results.push({ table: 'user_wallets', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 2. 创建货币交易表
    try {
      const { error } = await supabase
        .from('currency_transactions')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('货币交易表不存在，需要创建');
        results.push({ table: 'currency_transactions', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('货币交易表已存在');
        results.push({ table: 'currency_transactions', success: true });
      }
    } catch (err) {
      results.push({ table: 'currency_transactions', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 3. 创建货币规则表
    try {
      const { error } = await supabase
        .from('currency_rules')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('货币规则表不存在，需要创建');
        results.push({ table: 'currency_rules', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('货币规则表已存在');
        results.push({ table: 'currency_rules', success: true });
      }
    } catch (err) {
      results.push({ table: 'currency_rules', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 4. 创建用户货币收益表
    try {
      const { error } = await supabase
        .from('user_currency_earnings')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('用户货币收益表不存在，需要创建');
        results.push({ table: 'user_currency_earnings', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('用户货币收益表已存在');
        results.push({ table: 'user_currency_earnings', success: true });
      }
    } catch (err) {
      results.push({ table: 'user_currency_earnings', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 5. 创建货币商品表
    try {
      const { error } = await supabase
        .from('currency_products')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('货币商品表不存在，需要创建');
        results.push({ table: 'currency_products', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('货币商品表已存在');
        results.push({ table: 'currency_products', success: true });
      }
    } catch (err) {
      results.push({ table: 'currency_products', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 6. 创建用户购买表
    try {
      const { error } = await supabase
        .from('user_purchases')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('用户购买表不存在，需要创建');
        results.push({ table: 'user_purchases', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('用户购买表已存在');
        results.push({ table: 'user_purchases', success: true });
      }
    } catch (err) {
      results.push({ table: 'user_purchases', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 7. 创建礼物表
    try {
      const { error } = await supabase
        .from('gifts')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('礼物表不存在，需要创建');
        results.push({ table: 'gifts', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('礼物表已存在');
        results.push({ table: 'gifts', success: true });
      }
    } catch (err) {
      results.push({ table: 'gifts', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    // 8. 创建礼物交易表
    try {
      const { error } = await supabase
        .from('gift_transactions')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // 表不存在
        console.log('礼物交易表不存在，需要创建');
        results.push({ table: 'gift_transactions', success: false, error: '表不存在，请手动创建' });
      } else {
        console.log('礼物交易表已存在');
        results.push({ table: 'gift_transactions', success: true });
      }
    } catch (err) {
      results.push({ table: 'gift_transactions', success: false, error: err instanceof Error ? err.message : '未知错误' });
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`检查完成: ${successCount} 个表存在, ${failureCount} 个表不存在`);

    return NextResponse.json({
      message: '桃花币系统数据库表检查完成',
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount
      },
      results,
      instructions: failureCount > 0 ? '请在Supabase控制台中手动创建缺失的表，或使用提供的SQL脚本' : '所有表都已存在'
    });

  } catch (error) {
    console.error('检查过程中出错:', error);
    return NextResponse.json(
      { error: '检查失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 