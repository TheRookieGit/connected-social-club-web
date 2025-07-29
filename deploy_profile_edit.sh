#!/bin/bash

# 用户完整资料编辑功能部署脚本

echo "🚀 开始部署用户完整资料编辑功能..."

# 1. 检查环境变量
echo "📋 检查环境变量..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ 缺少必要的环境变量:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - JWT_SECRET"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 构建项目
echo "🔨 构建项目..."
npm run build

# 4. 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

# 5. 数据库设置说明
echo ""
echo "📊 数据库设置说明:"
echo "请在Supabase SQL Editor中运行以下脚本:"
echo ""
echo "1. 运行 database_schema_extended.sql 来扩展用户表结构"
echo "2. 运行 setup_avatar_storage.sql 来设置头像存储"
echo ""
echo "📝 手动设置步骤:"
echo "1. 登录 Supabase Dashboard"
echo "2. 进入 SQL Editor"
echo "3. 复制并运行 database_schema_extended.sql 的内容"
echo "4. 复制并运行 setup_avatar_storage.sql 的内容"
echo "5. 验证表结构是否正确创建"
echo ""
echo "🎯 功能特性:"
echo "✅ 完整的用户资料字段支持"
echo "✅ 多种输入类型（文本、选择、多选、布尔值）"
echo "✅ 实时字段验证和状态显示"
echo "✅ 响应式设计，支持移动端"
echo "✅ 与现有头像上传功能集成"
echo "✅ 集成式界面，无需跳转页面"
echo ""
echo "🔗 访问链接:"
echo "- 个人资料模态框: 在主页点击个人资料按钮"
echo "- 所有资料字段都在同一个界面中编辑"
echo ""
echo "✨ 部署完成！" 