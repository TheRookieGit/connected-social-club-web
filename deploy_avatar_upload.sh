#!/bin/bash

# 头像上传功能部署脚本
# 使用方法: ./deploy_avatar_upload.sh

echo "🚀 开始部署头像上传功能..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 检查依赖..."
if ! npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo "📦 安装 Supabase 依赖..."
    npm install @supabase/supabase-js
fi

echo "🔧 检查环境变量..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: 未找到 .env.local 文件"
    echo "请确保配置了以下环境变量:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - JWT_SECRET"
else
    echo "✅ 找到 .env.local 文件"
fi

echo "📁 检查文件结构..."
files_to_check=(
    "app/api/user/upload-avatar/route.ts"
    "app/test-avatar-upload/page.tsx"
    "components/ProfileModal.tsx"
    "setup_avatar_storage.sql"
    "AVATAR_UPLOAD_GUIDE.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ 缺少文件: $file"
    fi
done

echo ""
echo "🔧 下一步操作:"
echo "1. 在 Supabase SQL Editor 中运行 setup_avatar_storage.sql"
echo "2. 确保环境变量已正确配置"
echo "3. 运行 'npm run build' 检查构建"
echo "4. 部署到 Vercel"
echo "5. 访问 /test-avatar-upload 进行测试"
echo ""
echo "📖 详细说明请查看 AVATAR_UPLOAD_GUIDE.md"
echo ""
echo "🎉 部署脚本执行完成！" 