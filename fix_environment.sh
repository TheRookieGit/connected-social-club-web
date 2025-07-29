#!/bin/bash

# 快速修复环境变量和数据库问题

echo "🔧 开始修复环境变量和数据库问题..."

# 1. 检查是否已存在.env.local文件
if [ -f ".env.local" ]; then
    echo "⚠️  发现现有的 .env.local 文件"
    echo "请手动检查并更新以下环境变量："
    echo ""
    echo "必需的环境变量："
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - JWT_SECRET"
    echo ""
    echo "请参考 ENVIRONMENT_SETUP.md 文件获取详细说明"
else
    echo "📝 创建 .env.local 文件模板..."
    cat > .env.local << 'EOF'
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT密钥
JWT_SECRET=your_jwt_secret_here

# 开发环境配置
NODE_ENV=development
EOF
    echo "✅ .env.local 文件已创建"
    echo ""
    echo "⚠️  请编辑 .env.local 文件，替换为您的实际配置值"
fi

echo ""
echo "📊 数据库修复说明："
echo ""
echo "1. 在Supabase SQL Editor中运行以下脚本："
echo "   - database_schema_extended_fixed.sql (修复UUID转换问题)"
echo "   - setup_avatar_storage.sql (设置头像存储)"
echo ""
echo "2. 修复的关键点："
echo "   - 解决了 UUID 到 BIGINT 的类型转换问题"
echo "   - 使用简化的权限控制策略"
echo "   - 避免了复杂的 auth.uid() 类型转换"
echo ""
echo "3. 验证步骤："
echo "   - 访问 /api/debug-bucket 检查配置"
echo "   - 访问 /api/test-db 测试数据库连接"
echo "   - 重启开发服务器: npm run dev"
echo ""
echo "📖 详细说明请查看："
echo "   - ENVIRONMENT_SETUP.md (环境变量设置)"
echo "   - PROFILE_EDIT_GUIDE.md (功能使用指南)"
echo ""
echo "✨ 修复完成！请按照上述步骤配置环境变量和数据库。" 