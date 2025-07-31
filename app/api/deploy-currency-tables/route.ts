import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '../../../lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('开始部署桃花币系统数据库表...');
    
    const supabase = createSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: '无法创建Supabase客户端' }, { status: 500 });
    }

    // 读取SQL文件
    const sqlFilePath = path.join(process.cwd(), 'currency_system_schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL文件读取成功，长度:', sqlContent.length, '字符');

    // 分割SQL语句并逐个执行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`找到 ${statements.length} 个SQL语句`);

    const results = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`执行语句 ${i + 1}/${statements.length}:`, statement.substring(0, 100) + '...');
      
      try {
        // 使用rpc调用执行SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`语句 ${i + 1} 执行失败:`, error);
          results.push({ 
            statement: i + 1, 
            success: false, 
            error: error.message 
          });
        } else {
          console.log(`语句 ${i + 1} 执行成功`);
          results.push({ 
            statement: i + 1, 
            success: true, 
            data 
          });
        }
      } catch (err) {
        console.error(`语句 ${i + 1} 执行异常:`, err);
        results.push({ 
          statement: i + 1, 
          success: false, 
          error: err instanceof Error ? err.message : '未知错误' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`部署完成: ${successCount} 成功, ${failureCount} 失败`);

    return NextResponse.json({
      message: '桃花币系统数据库表部署完成',
      summary: {
        total: statements.length,
        success: successCount,
        failure: failureCount
      },
      results
    });

  } catch (error) {
    console.error('部署过程中出错:', error);
    return NextResponse.json(
      { error: '部署失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 