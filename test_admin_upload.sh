#!/bin/bash

echo "🧪 测试管理员模式照片上传 API"
echo "================================"

echo ""
echo "📋 测试步骤："
echo "1. 检查环境变量"
echo "2. 测试管理员 API 连接"
echo "3. 验证存储桶创建"
echo ""

# 检查环境变量
echo "🔍 检查环境变量..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL 未设置"
else
    echo "✅ NEXT_PUBLIC_SUPABASE_URL 已设置"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY 未设置"
else
    echo "✅ SUPABASE_SERVICE_ROLE_KEY 已设置"
fi

echo ""
echo "🌐 测试 API 端点..."

# 测试调试 API
echo "📊 运行详细诊断..."
curl -s http://localhost:3000/api/debug-storage-detailed | jq '.results.analysis'

echo ""
echo "📝 下一步操作："
echo "1. 访问: http://localhost:3000/test-photo-upload"
echo "2. 选择照片文件"
echo "3. 点击上传按钮"
echo "4. 检查是否成功"
echo ""

echo "🔗 有用的链接："
echo "   - 测试页面: http://localhost:3000/test-photo-upload"
echo "   - 照片页面: http://localhost:3000/photos"
echo "   - 用户照片: http://localhost:3000/user-photos"
echo ""

echo "📚 如果仍然失败，请检查："
echo "   - 环境变量是否正确设置"
echo "   - Service Role Key 是否有足够权限"
echo "   - 网络连接是否正常"
echo "" 