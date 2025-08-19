#!/bin/bash

echo "🚀 Social Club 移动端环境配置脚本"
echo "=================================="

# 检查是否已存在.env文件
if [ -f ".env" ]; then
    echo "⚠️  .env文件已存在，是否要覆盖？(y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📝 覆盖现有.env文件..."
    else
        echo "❌ 取消配置"
        exit 0
    fi
fi

echo ""
echo "📋 请填写以下配置信息："
echo ""

# API配置
echo "🌐 API配置"
read -p "请输入API基础URL (例如: https://your-app.vercel.app/api): " api_url
if [ -z "$api_url" ]; then
    api_url="https://your-domain.com/api"
fi

# Supabase配置
echo ""
echo "🗄️  Supabase配置"
read -p "请输入Supabase URL: " supabase_url
if [ -z "$supabase_url" ]; then
    supabase_url="https://your-project.supabase.co"
fi

read -p "请输入Supabase Anon Key: " supabase_key
if [ -z "$supabase_key" ]; then
    supabase_key="your-supabase-anon-key"
fi

# Stream Chat配置
echo ""
echo "💬 Stream Chat配置"
read -p "请输入Stream API Key: " stream_key
if [ -z "$stream_key" ]; then
    stream_key="your-stream-api-key"
fi

# LinkedIn配置
echo ""
echo "🔗 LinkedIn OAuth配置"
read -p "请输入LinkedIn Client ID: " linkedin_id
if [ -z "$linkedin_id" ]; then
    linkedin_id="your-linkedin-client-id"
fi

# 创建.env文件
echo ""
echo "📝 创建.env文件..."

cat > .env << EOF
# API配置
EXPO_PUBLIC_API_BASE_URL=$api_url

# Supabase配置
EXPO_PUBLIC_SUPABASE_URL=$supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=$supabase_key

# Stream Chat配置
EXPO_PUBLIC_STREAM_API_KEY=$stream_key

# LinkedIn OAuth配置
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=$linkedin_id
EXPO_PUBLIC_LINKEDIN_REDIRECT_URI=socialclub://auth-callback

# 其他配置
EXPO_PUBLIC_APP_NAME=Social Club
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF

echo "✅ .env文件创建成功！"
echo ""
echo "🔧 下一步操作："
echo "1. 检查.env文件内容是否正确"
echo "2. 运行 'npx expo start' 启动应用"
echo "3. 测试各项功能是否正常"
echo ""
echo "📖 详细配置说明请查看 ENVIRONMENT_SETUP.md" 