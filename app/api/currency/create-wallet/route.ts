import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '缺少用户ID' },
        { status: 400 }
      );
    }

    console.log(`为用户 ${userId} 创建钱包...`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 首先检查钱包是否已存在
    const { data: existingWallet, error: checkError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingWallet) {
      return NextResponse.json({
        success: true,
        message: '钱包已存在',
        data: existingWallet
      });
    }

    // 如果表不存在，会在这里报错，我们需要处理这个错误
    if (checkError && checkError.code === '42P01') {
      // 表不存在，需要先创建表
      console.log('用户钱包表不存在，请先在Supabase控制台创建表');
      return NextResponse.json(
        { 
          success: false, 
          message: '数据库表不存在，请联系管理员创建桃花币系统表' 
        },
        { status: 500 }
      );
    }

    // 创建用户钱包
    const { data: wallet, error: createError } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        balance: 100, // 给新用户100个桃花币作为初始余额
        total_earned: 100,
        total_spent: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('创建钱包失败:', createError);
      return NextResponse.json(
        { success: false, message: '创建钱包失败: ' + (createError.message || '未知错误') },
        { status: 500 }
      );
    }

    console.log(`用户 ${userId} 的钱包创建成功`);

    return NextResponse.json({
      success: true,
      message: '钱包创建成功',
      data: wallet
    });

  } catch (error) {
    console.error('创建钱包过程中出错:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
} 