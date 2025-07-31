#!/bin/bash

# 用户照片页面部署脚本
# 用于部署新创建的用户照片展示功能

echo "🚀 开始部署用户照片页面功能..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查必要的文件是否存在
echo "📋 检查必要文件..."

required_files=(
    "app/user-photos/page.tsx"
    "app/test-user-photos/page.tsx"
    "app/test-photo-upload/page.tsx"
    "app/api/user/upload-photos/route.ts"
    "USER_PHOTOS_GUIDE.md"
    "types/user.ts"
    "components/ProfileModal.tsx"
    "app/dashboard/page.tsx"
    "setup_user_photos_storage.sql"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误：缺少必要文件 $file"
        exit 1
    fi
done

echo "✅ 所有必要文件都存在"

# 检查数据库字段
echo "🗄️ 检查数据库字段..."

# 检查photos字段是否已添加
if [ -f "add_photos_field.sql" ]; then
    echo "📝 发现数据库更新脚本：add_photos_field.sql"
    echo "💡 请确保已在数据库中运行此脚本以添加photos字段"
else
    echo "⚠️ 警告：未找到数据库更新脚本"
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 项目构建成功"
else
    echo "❌ 项目构建失败"
    exit 1
fi

# 检查环境变量
echo "🔧 检查环境变量..."
required_env_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "JWT_SECRET"
)

for var in "${required_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️ 警告：环境变量 $var 未设置"
    else
        echo "✅ 环境变量 $var 已设置"
    fi
done

# 部署到Vercel（如果配置了）
if command -v vercel &> /dev/null; then
    echo "🚀 检测到Vercel CLI，是否要部署到Vercel？(y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📤 部署到Vercel..."
        vercel --prod
    fi
else
    echo "💡 提示：安装Vercel CLI可以自动部署"
    echo "   npm install -g vercel"
fi

echo ""
echo "🎉 用户照片页面功能部署完成！"
echo ""
echo "📖 使用说明："
echo "1. 访问 /user-photos 查看用户照片页面"
echo "2. 访问 /test-user-photos 测试页面功能"
echo "3. 访问 /test-photo-upload 测试照片上传功能"
echo "4. 在仪表板点击相机图标访问照片页面"
echo "5. 在个人资料模态框中点击'查看全部照片'"
echo ""
echo "📚 详细文档：USER_PHOTOS_GUIDE.md"
echo ""
echo "🔧 如果遇到问题："
echo "1. 检查数据库是否已添加photos字段"
echo "2. 确认环境变量配置正确"
echo "3. 查看浏览器控制台错误信息"
echo "" 