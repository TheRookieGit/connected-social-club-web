// 调试存储桶状态的脚本
// 在浏览器控制台中运行

async function debugStorageBucket() {
  console.log('🔍 开始调试存储桶状态...');
  
  try {
    // 检查环境变量
    console.log('📋 环境变量检查:');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置');
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置');
    
    // 创建 Supabase 客户端
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckhxivbcnagwgpzljzrl.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔗 Supabase 客户端创建成功');
    
    // 列出所有存储桶
    console.log('📦 获取存储桶列表...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ 获取存储桶列表失败:', listError);
      return;
    }
    
    console.log('✅ 存储桶列表:', buckets);
    
    // 查找 user-photos 存储桶
    const userPhotosBucket = buckets.find(bucket => bucket.name === 'user-photos');
    
    if (userPhotosBucket) {
      console.log('✅ 找到 user-photos 存储桶:', userPhotosBucket);
      
      // 检查存储桶权限
      console.log('🔐 检查存储桶权限...');
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage')
        .like('policyname', '%photos%');
      
      if (policyError) {
        console.error('❌ 获取策略失败:', policyError);
      } else {
        console.log('✅ 存储策略:', policies);
      }
      
    } else {
      console.error('❌ 未找到 user-photos 存储桶');
      console.log('📋 可用的存储桶:', buckets.map(b => b.name));
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

// 运行调试
debugStorageBucket(); 