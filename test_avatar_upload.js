// 头像上传API测试脚本
// 使用方法: node test_avatar_upload.js

const fs = require('fs');
const path = require('path');

// 模拟测试数据
const testData = {
  // 这里需要替换为实际的测试数据
  token: 'your_jwt_token_here',
  testImagePath: './test-image.jpg' // 需要提供一个测试图片
};

async function testAvatarUpload() {
  console.log('🧪 开始测试头像上传功能...\n');

  // 检查测试图片是否存在
  if (!fs.existsSync(testData.testImagePath)) {
    console.log('⚠️  测试图片不存在，跳过文件上传测试');
    console.log('请将测试图片放在项目根目录，命名为 test-image.jpg');
    return;
  }

  try {
    // 读取测试图片
    const imageBuffer = fs.readFileSync(testData.testImagePath);
    const formData = new FormData();
    formData.append('avatar', new Blob([imageBuffer], { type: 'image/jpeg' }), 'test-image.jpg');

    console.log('📤 模拟上传请求...');
    
    // 注意：这个测试需要在浏览器环境中运行，因为使用了FormData
    console.log('⚠️  此测试脚本需要在浏览器环境中运行');
    console.log('请访问 /test-avatar-upload 页面进行实际测试\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 检查API文件是否存在
function checkFiles() {
  console.log('📁 检查文件结构...\n');
  
  const files = [
    'app/api/user/upload-avatar/route.ts',
    'app/test-avatar-upload/page.tsx',
    'components/ProfileModal.tsx',
    'setup_avatar_storage.sql',
    'AVATAR_UPLOAD_GUIDE.md'
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - 文件不存在`);
    }
  });

  console.log('\n📋 检查环境变量...');
  if (fs.existsSync('.env.local')) {
    console.log('✅ .env.local 文件存在');
  } else {
    console.log('❌ .env.local 文件不存在');
  }

  console.log('\n📦 检查依赖...');
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies['@supabase/supabase-js']) {
      console.log('✅ @supabase/supabase-js 依赖已安装');
    } else {
      console.log('❌ @supabase/supabase-js 依赖未安装');
    }
  }
}

// 显示使用说明
function showUsage() {
  console.log('🎯 头像上传功能测试指南\n');
  console.log('1. 确保已运行 Supabase Storage 设置脚本');
  console.log('2. 配置环境变量');
  console.log('3. 启动开发服务器: npm run dev');
  console.log('4. 访问测试页面: http://localhost:3000/test-avatar-upload');
  console.log('5. 在个人资料页面测试头像上传功能\n');
  
  console.log('📖 详细说明请查看 AVATAR_UPLOAD_GUIDE.md');
}

// 主函数
function main() {
  console.log('🚀 头像上传功能验证工具\n');
  
  checkFiles();
  console.log('\n' + '='.repeat(50) + '\n');
  showUsage();
  console.log('\n' + '='.repeat(50) + '\n');
  testAvatarUpload();
}

// 运行测试
main(); 